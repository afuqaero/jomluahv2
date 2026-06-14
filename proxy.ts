import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "./app/lib/supabaseMiddlewareClient";

const PROTECTED_ROUTES = ["/dashboard", "/journal", "/chat", "/memories"];
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { supabase, getResponse } = createMiddlewareClient(request);

  // Refreshes the session cookie if it's expired — required for getUser() below to be accurate.
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return getResponse();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static, _next/image (static assets)
     * - favicon, manifest, and other public files with an extension
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
