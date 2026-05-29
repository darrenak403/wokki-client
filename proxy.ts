import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAppHomePath,
  getSessionHomePath,
  getTenantHomePath,
  isAppAreaPath,
  isPlatformPath,
  roleCanAccessAppPath,
} from "@/lib/support/auth/app-routes";
import { readOrganizationIdFromToken } from "@/lib/support/auth/jwt-claims";
import {
  readAuthCookies,
  resolveRoleFromRequest,
  resolveSessionRoleFromRequest,
} from "@/lib/support/auth/resolve-request-role";
import { BRANCH_ID_COOKIE } from "@/lib/support/routing/branch-cookie";
import {
  isLegacyRolePath,
  legacyPathToBranchScoped,
} from "@/lib/support/routing/tenant-routes";
import { isAppRole, ROLE_PLATFORM_OPERATOR, ROLE_USER } from "@/lib/types/roles";
import { MARKETING_PATHS } from "@/components/shared/site-nav";

const AUTH_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { token, roleCookie } = readAuthCookies(request);
  const sessionRole = resolveSessionRoleFromRequest(token, roleCookie);
  const appRole = resolveRoleFromRequest(token, roleCookie);
  const orgId = readOrganizationIdFromToken(token);
  const branchId = request.cookies.get(BRANCH_ID_COOKIE)?.value;

  const isPublicRoute = MARKETING_PATHS.some((r) => {
    if (r === "/") return pathname === "/";
    return pathname === r || pathname.startsWith(`${r}/`);
  });
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (pathname === "/join" || pathname.startsWith("/join/") || pathname === "/pending") {
    return NextResponse.redirect(new URL(getSessionHomePath(sessionRole), request.url));
  }

  if (isLegacyRolePath(pathname) && orgId && appRole) {
    if (branchId) {
      const dest = legacyPathToBranchScoped(pathname, orgId, branchId, appRole);
      return NextResponse.redirect(new URL(dest, request.url));
    }
    if (appRole === "Admin") {
      return NextResponse.redirect(new URL(`/${orgId}/admin/workspace`, request.url));
    }
  }

  const isAppRoute = isAppAreaPath(pathname);
  const isPlatformRoute = isPlatformPath(pathname);

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const home = sessionRole
      ? orgId && branchId && isAppRole(sessionRole)
        ? getTenantHomePath(sessionRole, orgId, branchId)
        : getSessionHomePath(sessionRole)
      : "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (!token || !sessionRole) {
    if (isPublicRoute || isAuthRoute) return NextResponse.next();
    const res = NextResponse.redirect(new URL("/login", request.url));
    if (token) {
      res.cookies.delete("authToken");
      res.cookies.delete("authRole");
    }
    return res;
  }

  if (isAuthRoute) {
    const home =
      orgId && branchId && isAppRole(sessionRole)
        ? getTenantHomePath(sessionRole, orgId, branchId)
        : getSessionHomePath(sessionRole);
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (sessionRole === ROLE_PLATFORM_OPERATOR) {
    if (isPlatformRoute || isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/platform", request.url));
  }

  if (isPlatformRoute) {
    return NextResponse.redirect(new URL(getAppHomePath(sessionRole), request.url));
  }

  if (isAppRoute && appRole && isAppRole(sessionRole)) {
    if (roleCanAccessAppPath(appRole, pathname)) {
      return NextResponse.next();
    }
    const fallback =
      orgId && branchId
        ? getTenantHomePath(appRole, orgId, branchId)
        : getAppHomePath(appRole);
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  if (isPublicRoute) return NextResponse.next();

  const home =
    orgId && branchId && isAppRole(sessionRole)
      ? getTenantHomePath(sessionRole, orgId, branchId)
      : getSessionHomePath(sessionRole);
  return NextResponse.redirect(new URL(home, request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|xml|glb)$).*)",
  ],
};
