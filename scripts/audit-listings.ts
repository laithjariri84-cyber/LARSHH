/**
 * Read-only audit: listings, owners, auth users, dashboard scope simulation.
 * Does not mutate data.
 */
import { ListingStatus, PrismaClient } from "@prisma/client";

import { AGENT_EMAIL, FOUNDER_EMAIL } from "../src/lib/auth/roles";
import { queryDashboardMetrics } from "../src/server/dashboard/dashboard.repository";

const prisma = new PrismaClient();

async function main() {
  const totalListings = await prisma.listing.count();
  const activeNotDeleted = await prisma.listing.count({
    where: { deletedAt: null },
  });
  const statusBreakdown = await prisma.listing.groupBy({
    by: ["status"],
    where: { deletedAt: null },
    _count: { _all: true },
  });

  const listingsWithAgents = await prisma.listing.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      status: true,
      agentId: true,
      agent: {
        select: {
          id: true,
          userId: true,
          user: { select: { email: true, fullName: true } },
        },
      },
    },
  });

  const agentOwnership = new Map<
    string,
    { email: string; name: string | null; count: number; agentId: string }
  >();
  for (const listing of listingsWithAgents) {
    const email = listing.agent.user.email;
    const key = listing.agentId;
    const existing = agentOwnership.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      agentOwnership.set(key, {
        email,
        name: listing.agent.user.fullName,
        count: 1,
        agentId: listing.agentId,
      });
    }
  }

  const dbUsers = await prisma.user.findMany({
    select: {
      email: true,
      fullName: true,
      roleAssignments: { select: { role: true } },
      agent: { select: { id: true } },
    },
  });

  let authUsers: Array<{ email: string; id: string; created_at: Date }> = [];
  try {
    authUsers = await prisma.$queryRaw<
      Array<{ email: string; id: string; created_at: Date }>
    >`
      SELECT email, id, created_at
      FROM auth.users
      WHERE lower(email) IN (
        lower(${FOUNDER_EMAIL}),
        lower(${AGENT_EMAIL})
      )
    `;
  } catch (error) {
    console.log(
      "[audit] auth.users query failed:",
      error instanceof Error ? error.message : error
    );
  }

  const activeCount = statusBreakdown.find((s) => s.status === ListingStatus.ACTIVE)?._count._all ?? 0;
  const nonActiveCount = activeNotDeleted - activeCount;

  const agentEntry = [...agentOwnership.values()].find(
    (o) => o.email.toLowerCase() === AGENT_EMAIL.toLowerCase()
  );

  const globalMetrics = await queryDashboardMetrics({});
  const agentMetrics = agentEntry
    ? await queryDashboardMetrics({ agentId: agentEntry.agentId })
    : null;

  console.log(JSON.stringify(
    {
      listings: {
        totalIncludingDeleted: totalListings,
        notDeleted: activeNotDeleted,
        statusBreakdown: statusBreakdown.map((s) => ({
          status: s.status,
          count: s._count._all,
        })),
        nonActiveNotDeleted: nonActiveCount,
        activeNotDeleted: activeCount,
      },
      ownership: [...agentOwnership.values()],
      prismaUsers: dbUsers,
      supabaseAuthUsers: authUsers.map((u) => ({
        email: u.email,
        id: u.id,
        createdAt: u.created_at,
      })),
      dashboardMetrics: {
        global: globalMetrics,
        agentScoped: agentMetrics,
        founderScoped: await queryDashboardMetrics({ noListings: true }),
      },
      expectedAgentEmail: AGENT_EMAIL,
      expectedFounderEmail: FOUNDER_EMAIL,
    },
    null,
    2
  ));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
