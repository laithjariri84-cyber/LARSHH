import type { PrismaClient } from "@prisma/client";

import {
  AGENT_EMAIL,
  FOUNDER_DISPLAY_NAME,
  FOUNDER_EMAIL,
} from "../../src/lib/auth/roles";

const DEFAULT_ORG_ID = "00000000-0000-4000-8000-000000000001";

export type RoleSystemSeedResult = {
  founderUserId: string | null;
  agentUserId: string | null;
  targetAgentId: string | null;
  listingsReassigned: number;
  agentListingCount: number;
  founderListingCount: number;
  totalListingCount: number;
};

async function findUserByEmail(prisma: PrismaClient, email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { agent: true, roleAssignments: true },
  });
}

async function bootstrapUserFromSupabaseAuth(
  prisma: PrismaClient,
  email: string,
  fullName: string | null
) {
  const existing = await findUserByEmail(prisma, email);
  if (existing) return existing;

  const authRows = await prisma.$queryRaw<Array<{ id: string; email: string }>>`
    SELECT id, email
    FROM auth.users
    WHERE lower(email) = lower(${email})
    LIMIT 1
  `;

  const authUser = authRows[0];
  if (!authUser) return null;

  return prisma.user.upsert({
    where: { id: authUser.id },
    create: {
      id: authUser.id,
      organizationId: DEFAULT_ORG_ID,
      email: email.toLowerCase(),
      fullName,
      status: "ACTIVE",
    },
    update: {
      email: email.toLowerCase(),
      ...(fullName ? { fullName } : {}),
    },
    include: { agent: true, roleAssignments: true },
  });
}

async function ensureRole(
  prisma: PrismaClient,
  userId: string,
  role: "FOUNDER" | "AGENT" | "ADMIN" | "MEMBER"
) {
  await prisma.userRoleAssignment.upsert({
    where: { userId_role: { userId, role } },
    create: { userId, role },
    update: {},
  });
}

async function ensureAgentRecord(
  prisma: PrismaClient,
  userId: string,
  agencyName = "LARSSH"
) {
  return prisma.agent.upsert({
    where: { userId },
    create: { userId, agencyName },
    update: { agencyName },
  });
}

async function countListingsForUserAgent(
  prisma: PrismaClient,
  userId: string | null
): Promise<number> {
  if (!userId) return 0;

  const agent = await prisma.agent.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!agent) return 0;

  return prisma.listing.count({
    where: { agentId: agent.id, deletedAt: null },
  });
}

/**
 * Assigns founder/agent roles, sets founder profile, and moves every existing
 * listing to the agent account. Does not create listings.
 */
export async function seedRoleSystem(
  prisma: PrismaClient
): Promise<RoleSystemSeedResult> {
  const result: RoleSystemSeedResult = {
    founderUserId: null,
    agentUserId: null,
    targetAgentId: null,
    listingsReassigned: 0,
    agentListingCount: 0,
    founderListingCount: 0,
    totalListingCount: 0,
  };

  await prisma.organization.upsert({
    where: { id: DEFAULT_ORG_ID },
    create: {
      id: DEFAULT_ORG_ID,
      name: "LARSSH",
      slug: "paragonos",
      defaultCurrency: "AED",
    },
    update: {},
  });

  const founderUser =
    (await findUserByEmail(prisma, FOUNDER_EMAIL)) ??
    (await bootstrapUserFromSupabaseAuth(
      prisma,
      FOUNDER_EMAIL,
      FOUNDER_DISPLAY_NAME
    ));
  const agentUser =
    (await findUserByEmail(prisma, AGENT_EMAIL)) ??
    (await bootstrapUserFromSupabaseAuth(prisma, AGENT_EMAIL, null));

  if (founderUser) {
    result.founderUserId = founderUser.id;
    try {
      await ensureRole(prisma, founderUser.id, "FOUNDER");
    } catch (error) {
      console.warn(
        `[roles] Could not persist FOUNDER role in database (email bootstrap still applies):`,
        error instanceof Error ? error.message : error
      );
    }
    await prisma.user.update({
      where: { id: founderUser.id },
      data: { fullName: FOUNDER_DISPLAY_NAME },
    });
    console.log(`[roles] Founder account linked to ${FOUNDER_EMAIL}`);
  } else {
    console.warn(
      `[roles] Founder user not found (${FOUNDER_EMAIL}). Sign in once so Supabase sync creates the user row, then re-run seed.`
    );
  }

  if (agentUser) {
    result.agentUserId = agentUser.id;
    await ensureRole(prisma, agentUser.id, "AGENT");
    const agentRecord = await ensureAgentRecord(prisma, agentUser.id);
    result.targetAgentId = agentRecord.id;
    console.log(`[roles] AGENT role assigned to ${AGENT_EMAIL}`);
  } else {
    console.warn(
      `[roles] Agent user not found (${AGENT_EMAIL}). Sign in once so Supabase sync creates the user row, then re-run seed.`
    );
  }

  result.totalListingCount = await prisma.listing.count({
    where: { deletedAt: null },
  });

  if (!result.targetAgentId) {
    result.founderListingCount = await countListingsForUserAgent(
      prisma,
      result.founderUserId
    );
    return result;
  }

  const reassigned = await prisma.listing.updateMany({
    where: {
      deletedAt: null,
      agentId: { not: result.targetAgentId },
    },
    data: { agentId: result.targetAgentId },
  });

  result.listingsReassigned = reassigned.count;
  result.agentListingCount = await prisma.listing.count({
    where: { agentId: result.targetAgentId, deletedAt: null },
  });
  result.founderListingCount = await countListingsForUserAgent(
    prisma,
    result.founderUserId
  );

  console.log(
    `[roles] Reassigned ${result.listingsReassigned} listing(s) to agent ${result.targetAgentId}`
  );
  console.log(
    `[roles] Agent listing count: ${result.agentListingCount} / ${result.totalListingCount} total`
  );
  console.log(`[roles] Founder listing count: ${result.founderListingCount}`);

  return result;
}
