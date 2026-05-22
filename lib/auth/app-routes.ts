import { normalizeAppRole } from "@/lib/auth/normalize-role";
import {
  APP_ROLES,
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_USER,
  type AppRole,
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

export const APP_AREA_PREFIXES = Object.values(APP_AREA_PREFIX);

export function isAppAreaPath(pathname: string): boolean {
  return APP_AREA_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getAppAreaForRole(role: AppRole): string {
  return APP_AREA_PREFIX[role];
}

export function getAppHomePath(role: AppRole | string | unknown): string {
  const normalized = typeof role === "string" || typeof role === "number"
    ? normalizeAppRole(role)
    : APP_ROLES.includes(role as AppRole)
      ? (role as AppRole)
      : normalizeAppRole(role);

  if (normalized) return APP_HOME_PATH[normalized];
  return APP_HOME_PATH[ROLE_USER];
}

/** Role được phép truy cập pathname trong khu app. */
export function roleCanAccessAppPath(role: AppRole, pathname: string): boolean {
  const prefix = APP_AREA_PREFIX[role];
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function resolveRoleFromRoles(roles: string[]): AppRole | null {
  for (const role of APP_ROLES) {
    if (roles.includes(role)) return role;
  }
  return null;
}
