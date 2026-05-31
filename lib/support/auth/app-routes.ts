import { normalizeAppRole, normalizeSessionRole } from "@/lib/support/auth/normalize-role";
import { getPostLoginPath } from "@/lib/support/auth/post-login-route";
import {
  parseTenantPath,
  buildBranchScopedPath,
} from "@/lib/support/routing/tenant-routes";
import {
  APP_ROLES,
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_PLATFORM_OPERATOR,
  ROLE_USER,
  isAppRole,
  type AppRole,
  type SessionRole,
} from "@/lib/types/roles";

/** URL prefix cho khu vực quản lý theo role (mọi tính năng nằm trong prefix này). */
export const APP_AREA_PREFIX: Record<AppRole, string> = {
  [ROLE_ADMIN]: "/admin",
  [ROLE_MANAGER]: "/manager",
  [ROLE_USER]: "/user",
};

export const APP_HOME_PATH: Record<AppRole, string> = {
  [ROLE_ADMIN]: `${APP_AREA_PREFIX[ROLE_ADMIN]}/dashboard`,
  [ROLE_MANAGER]: `${APP_AREA_PREFIX[ROLE_MANAGER]}/dashboard`,
  [ROLE_USER]: `${APP_AREA_PREFIX[ROLE_USER]}/dashboard`,
};

export const PLATFORM_HOME_PATH = "/platform";

export const APP_AREA_PREFIXES = Object.values(APP_AREA_PREFIX);

export function isAppAreaPath(pathname: string): boolean {
  if (parseTenantPath(pathname)) return true;
  return APP_AREA_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getTenantHomePath(role: AppRole, orgId: string, locationId: string): string {
  return buildBranchScopedPath(orgId, locationId, role, "dashboard");
}

export function isPlatformPath(pathname: string): boolean {
  return pathname === PLATFORM_HOME_PATH || pathname.startsWith(`${PLATFORM_HOME_PATH}/`);
}

export function getAppAreaForRole(role: AppRole): string {
  return APP_AREA_PREFIX[role];
}

export function getAppHomePath(
  role: AppRole | string | unknown,
  orgId?: string | null,
  locationId?: string | null
): string {
  const sessionRole = normalizeSessionRole(role);
  if (sessionRole) return getPostLoginPath(sessionRole, orgId, locationId);

  const normalized = normalizeAppRole(role);
  if (normalized) return getPostLoginPath(normalized, orgId, locationId);
  return getPostLoginPath(ROLE_USER, orgId, locationId);
}

/** @deprecated Prefer getPostLoginPath(role, orgId, locationId) — legacy `/admin/dashboard` has no page. */
export function getSessionHomePath(
  role: SessionRole | null | undefined,
  orgId?: string | null,
  locationId?: string | null
): string {
  return getPostLoginPath(role, orgId, locationId);
}

/** Role được phép truy cập pathname trong khu app. */
export function roleCanAccessAppPath(role: AppRole, pathname: string): boolean {
  const parsed = parseTenantPath(pathname);
  if (parsed) return parsed.role === role;
  const prefix = APP_AREA_PREFIX[role];
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function resolveRoleFromRoles(roles: string[]): AppRole | null {
  for (const role of APP_ROLES) {
    if (roles.includes(role)) return role;
  }
  return null;
}

export function resolveSessionRoleFromRoles(roles: string[]): SessionRole | null {
  for (const role of roles) {
    const normalized = normalizeSessionRole(role);
    if (normalized) return normalized;
  }
  return null;
}
