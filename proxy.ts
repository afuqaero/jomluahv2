import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./app/lib/auth/server";

const PROTECTED_ROUTES = ["/dashboard", "/journal", "/chat", "/memories", "/onboarding"];
const protectWithNeonAuth = auth.middleware({ loginUrl: "/login" });

/**
 * Neon Auth validates protected routes and refreshes its signed session cookie.
 * The lightweight onboarding cookie remains an application-only routing hint;
 * authorization is still enforced by Neon Auth and PostgreSQL RLS.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next({ request });
  }

  const authResponse = await protectWithNeonAuth(request);
  if (authResponse.headers.has("location")) {
    return authResponse;
  }

  const onboardingCompleted = request.cookies.get("jl_ob")?.value === "1";
  const hasResetParam = request.nextUrl.searchParams.get("reset") === "true";

  if (pathname === "/onboarding" && onboardingCompleted && !hasResetParam) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!onboardingCompleted && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return authResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\..*).*)"],
};
