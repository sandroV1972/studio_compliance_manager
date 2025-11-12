import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Percorsi pubblici - nessun redirect
  if (pathname.startsWith("/auth")) {
    if (session && pathname !== "/auth/logout") {
      // Se l'utente ha bisogno di onboarding, redirect a /onboarding
      if (session.user.needsOnboarding) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      // Altrimenti redirect basato sul ruolo dell'utente
      const redirectUrl = session.user.isSuperAdmin ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Richiedi autenticazione per tutte le altre route
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Intercetta utenti con needsOnboarding e forza redirect a /onboarding
  // Escludi solo la pagina di onboarding stessa e il logout
  if (
    session.user.needsOnboarding &&
    !pathname.startsWith("/onboarding") &&
    pathname !== "/auth/logout"
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Super Admin non possono accedere a /onboarding (non ne hanno bisogno)
  if (pathname.startsWith("/onboarding") && session.user.isSuperAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Utenti normali senza needsOnboarding non possono accedere a /onboarding
  if (
    pathname.startsWith("/onboarding") &&
    !session.user.needsOnboarding &&
    !session.user.isSuperAdmin
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Solo Super Admin possono accedere a /admin
  if (pathname.startsWith("/admin") && !session.user.isSuperAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Super Admin non possono accedere a /dashboard
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
