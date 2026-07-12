import { NextResponse } from "next/server";

import { syncUserFromSupabase } from "@/lib/auth/sync-user";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await syncUserFromSupabase(user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[auth/sync] failed:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
