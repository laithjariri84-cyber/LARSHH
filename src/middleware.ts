import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/env/config";
import { updateSession } from "@/lib/supabase/middleware";

function isUiOnlyMode() {
  return process.env.NEXT_PUBLIC_UI_ONLY === "true";
}

export async function middleware(request: NextRequest) {
  if (isUiOnlyMode()) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    const { pathname } = request.nextUrl;
    const isAuthRoute = pathname.startsWith("/login");
    const isPublicRoute =
      pathname.startsWith("/auth") || pathname.startsWith("/_next");

    if (!isAuthRoute && !isPublicRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirectTo", pathname);
      redirectUrl.searchParams.set("error", "supabase_not_configured");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  try {
    return await updateSession(request);
  } catch (error) {
    console.error("[middleware] updateSession failed:", error);
    const { pathname } = request.nextUrl;
    if (pathname.startsWith("/login") || pathname.startsWith("/auth")) {
      return NextResponse.next();
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
