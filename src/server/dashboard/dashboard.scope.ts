import { getAuthContext } from "@/lib/auth/session";
import {
  shouldExcludeListingsFromDashboard,
  shouldScopeDashboardToAgent,
} from "@/lib/auth/permissions";
import { isUiOnlyMode } from "@/lib/ui-only";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

import type { DashboardQueryScope } from "./dashboard.types";

const resolveAgentId = cache(async (userId: string): Promise<string | null> => {
  const agent = await prisma.agent.findUnique({
    where: { userId },
    select: { id: true },
  });
  return agent?.id ?? null;
});

export async function getDashboardQueryScope(): Promise<DashboardQueryScope> {
  if (isUiOnlyMode()) {
    return {};
  }

  const context = await getAuthContext();
  if (!context) {
    return {};
  }

  if (shouldExcludeListingsFromDashboard(context.appRole)) {
    return { noListings: true };
  }

  if (shouldScopeDashboardToAgent(context.appRole)) {
    const agentId = context.agentId ?? (await resolveAgentId(context.userId));
    if (agentId) {
      return { agentId };
    }
  }

  return {};
}

/** Prisma filter fragment; impossible match when founder admin view. */
const IMPOSSIBLE_LISTING_ID = "00000000-0000-0000-0000-000000000000";

export function listingScopeWhere(scope: DashboardQueryScope) {
  if (scope.noListings) {
    return { id: IMPOSSIBLE_LISTING_ID };
  }

  if (!scope.agentId) {
    return {};
  }

  return { agentId: scope.agentId };
}

export function isEmptyListingScope(scope: DashboardQueryScope): boolean {
  return Boolean(scope.noListings);
}
