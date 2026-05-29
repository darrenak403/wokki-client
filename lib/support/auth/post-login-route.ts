import { normalizeSessionRole } from "@/lib/support/auth/normalize-role";
import {
  isAppRole,
  ROLE_ADMIN,
  ROLE_PLATFORM_OPERATOR,
  ROLE_USER,
  type SessionRole,
} from "@/lib/types/roles";
import { PLATFORM_HOME_PATH } from "@/lib/support/auth/app-routes";
import {
  buildBranchScopedPath,
  buildOrgScopedPath,
} from "@/lib/support/routing/tenant-routes";

/** Sau đăng nhập / đăng ký — route theo role + org context. */
export function getPostLoginPath(
  role: SessionRole | null | undefined,
  orgId?: string | null,
  locationId?: string | null
): string {
  if (!role) return "/login";
  if (role === ROLE_PLATFORM_OPERATOR) return PLATFORM_HOME_PATH;
  if (!orgId || !isAppRole(role)) {
    return locationId && orgId
      ? buildBranchScopedPath(orgId, locationId, ROLE_USER, "dashboard")
      : "/login";
  }
  if (locationId) return buildBranchScopedPath(orgId, locationId, role, "dashboard");
  return buildOrgScopedPath(orgId, role, "workspace");
}

/** Org Admin mới — chưa có chi nhánh → onboarding. */
export function getOrgAdminLandingPath(
  orgId: string,
  locationCount: number | undefined,
  preferredLocationId?: string | null
): string {
  if (locationCount === 0) return buildOrgScopedPath(orgId, ROLE_ADMIN, "onboarding");
  if (preferredLocationId) {
    return buildBranchScopedPath(orgId, preferredLocationId, ROLE_ADMIN, "dashboard");
  }
  return buildOrgScopedPath(orgId, ROLE_ADMIN, "workspace");
}

export function normalizePostLoginRole(value: unknown): SessionRole | null {
  return normalizeSessionRole(value);
}
