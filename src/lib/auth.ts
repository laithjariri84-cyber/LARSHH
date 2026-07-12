import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { cache } from "react";

import { mockUser } from "@/features/dashboard/data/mock-dashboard";
import { isBenignAuthError } from "@/lib/auth/auth-errors";
import { getAccountDisplayName } from "@/lib/auth/roles";
import { getAuthContext } from "@/lib/auth/session";
import type { AppRole } from "@/lib/auth/roles";
import { isSupabaseConfigured } from "@/lib/env/config";
import { isUiOnlyMode } from "@/lib/ui-only";
import { getInitials } from "@/lib/utils";

export const getUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (!isBenignAuthError(error)) {
        console.error("[auth] getUser:", error.message);
      }
      return null;
    }

    return user;
  } catch (error) {
    if (!isBenignAuthError(error)) {
      console.error("[auth] getUser failed:", error);
    }
    return null;
  }
});

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export type ShellUser = {
  name: string;
  email: string;
  role: string;
  appRole: AppRole;
  initials: string;
};

export async function getShellUser(): Promise<ShellUser> {
  const context = await getAuthContext();

  if (context) {
    const user = await getUser();
    const metadataName =
      typeof user?.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null;
    const name = getAccountDisplayName(
      context.email,
      context.appRole,
      metadataName
    );

    return {
      name,
      email: context.email,
      role: context.displayTitle,
      appRole: context.appRole,
      initials: getInitials(name),
    };
  }

  if (isUiOnlyMode()) {
    return {
      name: mockUser.name,
      email: "",
      role: "CEO & Founder",
      appRole: "FOUNDER",
      initials: mockUser.initials,
    };
  }

  return {
    name: "User",
    email: "",
    role: "Member",
    appRole: "MEMBER",
    initials: "U",
  };
}

export { getAuthContext, requireFounder, requirePermission } from "@/lib/auth/session";
export type { AppRole, AuthContext } from "@/lib/auth/session";
