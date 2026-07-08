import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function redirectToLogin() {
  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  );
}

async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirectToLogin();
}

export async function POST() {
  return signOut();
}

export async function GET() {
  return signOut();
}
