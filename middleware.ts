import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/auth")) {
    if (session && pathname !== "/auth/logout") {
      // Redirect basato sul ruolo dell'utente
      const redirectUrl = session.user.isSuperAdmin ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (pathname.startsWith("/admin") && !session.user.isSuperAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard") && session.user.isSuperAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/structures/:path*",
    "/people/:path*",
    "/roles/:path*",
    "/deadlines/:path*",
    "/templates/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/auth/:path*",
    "/onboarding",
    "/dashboard/:path*",
  ],
};
