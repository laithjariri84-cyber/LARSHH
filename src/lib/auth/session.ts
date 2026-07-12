import { cache } from "react";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUiOnlyMode } from "@/lib/ui-only";

import { syncUserFromSupabase } from "./sync-user";

import {
  FOUNDER_EMAIL,
  getRoleDisplayTitle,
  resolveAppRole,
  type AppRole,
  type AuthContext,
} from "./roles";
import { hasPermission, type Permission } from "./permissions";

export type { AppRole, AuthContext };
export {
  FOUNDER_EMAIL,
  AGENT_EMAIL,
  getRoleDisplayTitle,
  resolveAppRole,
  ROLE_DISPLAY_TITLES,
} from "./roles";

const loadDbUserContext = cache(async (userId: string) => {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        roleAssignments: { select: { role: true } },
        agent: { select: { id: true } },
      },
    });
  } catch (error) {
    console.error("[auth] loadDbUserContext:", error);
    return null;
  }
});

export async function getAuthContext(): Promise<AuthContext | null> {
  if (isUiOnlyMode()) {
    return {
      userId: "ui-only-founder",
      email: FOUNDER_EMAIL,
      appRole: "FOUNDER",
      displayTitle: getRoleDisplayTitle("FOUNDER"),
      agentId: null,
    };
  }

  const user = await getUser();
  if (!user?.email) {
    return null;
  }

  let dbUser = await loadDbUserContext(user.id);
  if (!dbUser) {
    try {
      await syncUserFromSupabase(user);
      dbUser = await loadDbUserContext(user.id);
    } catch (error) {
      console.error("[auth] syncUserFromSupabase:", error);
    }
  }

  const dbRoles = dbUser?.roleAssignments.map((row) => row.role) ?? [];
  const appRole = resolveAppRole(user.email, dbRoles);

  return {
    userId: user.id,
    email: user.email,
    appRole,
    displayTitle: getRoleDisplayTitle(appRole),
    agentId: dbUser?.agent?.id ?? null,
  };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) {
    const error = new Error("Unauthorized");
    (error as Error & { status: number }).status = 401;
    throw error;
  }
  return context;
}

export async function requirePermission(permission: Permission) {
  const context = await requireAuthContext();

  if (!hasPermission(context.appRole, permission)) {
    const error = new Error("Forbidden");
    (error as Error & { status: number }).status = 403;
    throw error;
  }

  return context;
}

export async function isFounder(): Promise<boolean> {
  const context = await getAuthContext();
  return context?.appRole === "FOUNDER";
}

export async function requireFounder() {
  const context = await requireAuthContext();
  if (context.appRole !== "FOUNDER") {
    const error = new Error("Forbidden");
    (error as Error & { status: number }).status = 403;
    throw error;
  }
  return context;
}
