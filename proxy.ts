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
  buildOrgScopedPath,
  isLegacyRolePath,
  isUuidSegment,
  legacyPathToBranchScoped,
} from "@/lib/support/routing/tenant-routes";
import { isAppRole, ROLE_PLATFORM_OPERATOR, type SessionRole } from "@/lib/types/roles";
import { MARKETING_PATHS } from "@/components/shared/site-nav";

const AUTH_ROUTES = ["/login", "/register"];

function resolveRequestHomePath(
  sessionRole: SessionRole | null,
  orgId: string | null,
  branchId: string | undefined
): string {
  if (!sessionRole) return "/login";
  if (sessionRole === ROLE_PLATFORM_OPERATOR) return "/platform";
  if (orgId && isAppRole(sessionRole)) {
    return branchId
      ? getTenantHomePath(sessionRole, orgId, branchId)
      : buildOrgScopedPath(orgId, sessionRole, "workspace");
  }
  return getSessionHomePath(sessionRole, orgId, branchId);
}

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

  const tenantSegments = pathname.split("/").filter(Boolean);
  if (
    tenantSegments.length >= 2 &&
    isUuidSegment(tenantSegments[0]!) &&
    (tenantSegments[1] === "Admin" ||
      tenantSegments[1] === "Manager" ||
      tenantSegments[1] === "User")
  ) {
    const normalized = [
      tenantSegments[0],
      tenantSegments[1].toLowerCase(),
      ...tenantSegments.slice(2),
    ].join("/");
    return NextResponse.redirect(new URL(`/${normalized}`, request.url));
  }

  if (pathname === "/join" || pathname.startsWith("/join/") || pathname === "/pending") {
    return NextResponse.redirect(
      new URL(resolveRequestHomePath(sessionRole, orgId, branchId), request.url)
    );
  }

  if (isLegacyRolePath(pathname) && orgId && appRole) {
    if (branchId) {
      const dest = legacyPathToBranchScoped(pathname, orgId, branchId, appRole);
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.redirect(new URL(buildOrgScopedPath(orgId, appRole, "workspace"), request.url));
  }

  const isAppRoute = isAppAreaPath(pathname);
  const isPlatformRoute = isPlatformPath(pathname);

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const home = resolveRequestHomePath(sessionRole, orgId, branchId);
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
    const home = resolveRequestHomePath(sessionRole, orgId, branchId);
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (sessionRole === ROLE_PLATFORM_OPERATOR) {
    if (isPlatformRoute || isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/platform", request.url));
  }

  if (isPlatformRoute) {
    return NextResponse.redirect(new URL(resolveRequestHomePath(sessionRole, orgId, branchId), request.url));
  }

  if (isAppRoute && appRole && isAppRole(sessionRole)) {
    if (roleCanAccessAppPath(appRole, pathname)) {
      return NextResponse.next();
    }
    const fallback =
      orgId && branchId
        ? getTenantHomePath(appRole, orgId, branchId)
        : orgId
          ? buildOrgScopedPath(orgId, appRole, "workspace")
          : getAppHomePath(appRole, orgId, branchId);
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  if (isPublicRoute) return NextResponse.next();

  const home = resolveRequestHomePath(sessionRole, orgId, branchId);
  return NextResponse.redirect(new URL(home, request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|xml|glb)$).*)",
  ],
};
