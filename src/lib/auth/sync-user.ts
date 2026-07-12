import type { User as SupabaseUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";

import {
  AGENT_EMAIL,
  FOUNDER_DISPLAY_NAME,
  FOUNDER_EMAIL,
  normalizeEmail,
} from "./roles";

const DEFAULT_ORG_ID = "00000000-0000-4000-8000-000000000001";

async function ensureOrganization() {
  return prisma.organization.upsert({
    where: { id: DEFAULT_ORG_ID },
    create: {
      id: DEFAULT_ORG_ID,
      name: "LARSSH",
      slug: "paragonos",
      defaultCurrency: "AED",
    },
    update: {},
  });
}

/**
 * Ensures a Supabase Auth user has a matching Prisma user row, role, and agent
 * record when applicable. Safe to call on every authenticated request.
 */
export async function syncUserFromSupabase(supabaseUser: SupabaseUser) {
  const email = normalizeEmail(supabaseUser.email);
  if (!email) {
    return null;
  }

  await ensureOrganization();

  const isFounder = email === normalizeEmail(FOUNDER_EMAIL);
  const isAgent = email === normalizeEmail(AGENT_EMAIL);

  const metadataName =
    typeof supabaseUser.user_metadata?.full_name === "string"
      ? supabaseUser.user_metadata.full_name.trim()
      : null;

  const fullName = isFounder ? FOUNDER_DISPLAY_NAME : metadataName || null;

  const avatarUrl =
    typeof supabaseUser.user_metadata?.avatar_url === "string"
      ? supabaseUser.user_metadata.avatar_url
      : null;

  const user = await prisma.user.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id,
      organizationId: DEFAULT_ORG_ID,
      email,
      fullName,
      avatarUrl,
      status: "ACTIVE",
    },
    update: {
      email,
      ...(fullName ? { fullName } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  });

  if (isFounder) {
    await prisma.userRoleAssignment.upsert({
      where: { userId_role: { userId: user.id, role: "FOUNDER" } },
      create: { userId: user.id, role: "FOUNDER" },
      update: {},
    });
  }

  if (isAgent) {
    await prisma.userRoleAssignment.upsert({
      where: { userId_role: { userId: user.id, role: "AGENT" } },
      create: { userId: user.id, role: "AGENT" },
      update: {},
    });

    await prisma.agent.upsert({
      where: { userId: user.id },
      create: { userId: user.id, agencyName: "LARSSH" },
      update: { agencyName: "LARSSH" },
    });
  }

  return user;
}
