import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./app/lib/auth/server";

const PROTECTED_ROUTES = ["/dashboard", "/journal", "/chat", "/memories", "/onboarding", "/counselor", "/admin"];
const protectWithNeonAuth = auth.middleware({ loginUrl: "/login" });
const protectCounselorWithNeonAuth = auth.middleware({ loginUrl: "/counselor/login" });

/**
 * Neon Auth validates protected routes and refreshes its signed session cookie.
 * The lightweight onboarding cookie remains an application-only routing hint;
 * authorization is still enforced by Neon Auth and PostgreSQL RLS.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isCounselorAuthRoute = pathname === "/counselor/login" || pathname === "/counselor/register";
  const isProtectedRoute = !isCounselorAuthRoute && PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next({ request });
  }

  const authResponse = await (pathname.startsWith("/counselor") ? protectCounselorWithNeonAuth : protectWithNeonAuth)(request);
  if (authResponse.headers.has("location")) {
    return authResponse;
  }

  const onboardingCompleted = request.cookies.get("jl_ob")?.value === "1";
  const hasResetParam = request.nextUrl.searchParams.get("reset") === "true";

  if (pathname === "/onboarding" && onboardingCompleted && !hasResetParam) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isStaffRoute = pathname.startsWith("/counselor") || pathname.startsWith("/admin");
  if (!onboardingCompleted && pathname !== "/onboarding" && !isStaffRoute) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return authResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\..*).*)"],
};
