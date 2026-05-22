import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { MARKETING_PATHS } from "@/components/shared/site-nav";
import { ROLE_ADMIN } from "@/lib/types/roles";

const getUserRoles = (token: string | undefined): string[] => {
  if (!token) return [];
  try {
    const decoded = jwtDecode(token) as { role?: string | string[]; exp?: number } | null;

    if (decoded?.exp && decoded.exp < Math.floor(Date.now() / 1000)) return [];

    if (!decoded?.role) return [];
    return Array.isArray(decoded.role) ? decoded.role : [decoded.role];
  } catch {
    return [];
  }
};

const hasRole = (roles: string[], target: string) => roles.includes(target);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authToken")?.value;
  const userRoles = getUserRoles(token);

  const publicRoutes = [...MARKETING_PATHS, "/login", "/register"];
  const authRoutes = ["/login", "/register"];

  const isPublicRoute = publicRoutes.some((r) => {
    if (r === "/") return pathname === "/";
    return pathname === r || pathname.startsWith(`${r}/`);
  });
  const isAuthRoute = authRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  const isAdminRoute = pathname.startsWith("/admin/");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!token || userRoles.length === 0) {
    if (isPublicRoute) return NextResponse.next();
    const res = NextResponse.redirect(new URL("/login", request.url));
    if (token) res.cookies.delete("authToken");
    return res;
  }

  if (isAuthRoute) {
    if (hasRole(userRoles, ROLE_ADMIN)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAdminRoute && !hasRole(userRoles, ROLE_ADMIN)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardRoute || isAdminRoute) {
    return NextResponse.next();
  }

  if (!isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|xml|glb)$).*)",
  ],
};
