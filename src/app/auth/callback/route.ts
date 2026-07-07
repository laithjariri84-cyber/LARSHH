import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next =
    searchParams.get("next") ??
    searchParams.get("redirectTo") ??
    "/dashboard";

  if (code) {
    const supabase = await createClient();
    const result = await supabase.auth.exchangeCodeForSession(code);

    if (!result.error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error(
      "[auth/callback] exchangeCodeForSession:",
      result.error.message
    );
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
