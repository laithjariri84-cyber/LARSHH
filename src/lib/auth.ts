import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { cache } from "react";

import { mockUser } from "@/features/dashboard/data/mock-dashboard";
import { isUiOnlyMode } from "@/lib/ui-only";
import { getInitials } from "@/lib/utils";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

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
      console.error("[auth] getUser:", error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error("[auth] getUser failed:", error);
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
  initials: string;
};

export async function getShellUser(): Promise<ShellUser> {
  const user = await getUser();

  if (user?.email) {
    const name =
      (typeof user.user_metadata?.full_name === "string" &&
        user.user_metadata.full_name.trim()) ||
      user.email.split("@")[0] ||
      "User";
    const role =
      typeof user.user_metadata?.role === "string" &&
      user.user_metadata.role.trim()
        ? user.user_metadata.role
        : "LARSSH Member";

    return {
      name,
      email: user.email,
      role,
      initials: getInitials(name),
    };
  }

  if (isUiOnlyMode()) {
    return {
      name: mockUser.name,
      email: "",
      role: mockUser.role,
      initials: mockUser.initials,
    };
  }

  return {
    name: "User",
    email: "",
    role: "LARSSH",
    initials: "U",
  };
}
