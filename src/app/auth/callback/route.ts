import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { logRscError, rscTry } from "@/lib/rsc-debug";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/search";

    if (code) {
      const result = await rscTry("auth/callback:exchangeCodeForSession", async () => {
        const supabase = await createClient();
        return supabase.auth.exchangeCodeForSession(code);
      });

      if (!result.error) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      console.error(
        "[RSC ERROR] scope=auth/callback:exchangeCodeForSession message:",
        result.error.message
      );
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  } catch (error) {
    logRscError("auth/callback:GET", error);
  }
}
