import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { cache } from "react";

import { logRscError } from "@/lib/rsc-debug";
import { perfAsync } from "@/lib/perf/timer";

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

  return perfAsync("auth.getUser", async () => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("[RSC ERROR] scope=auth:getUser message:", error.message);
        return null;
      }

      return user;
    } catch (error) {
      console.error("[RSC ERROR] scope=auth:getUser threw:", error);
      logRscError("auth:getUser", error);
    }
  });
});

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
