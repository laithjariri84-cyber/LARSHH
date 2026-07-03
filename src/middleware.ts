import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

function isUiOnlyMode() {
  return process.env.NEXT_PUBLIC_UI_ONLY === "true";
}

export async function middleware(request: NextRequest) {
  if (isUiOnlyMode()) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
