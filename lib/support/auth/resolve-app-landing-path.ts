import { fetchStats } from "@/lib/api/services/fetchStats";
import { fetchLocationMembership } from "@/lib/api/services/fetchLocationMembership";
import {
  readFoundationSession,
  writeFoundationSession,
} from "@/lib/support/foundation/session-context";
import { setBranchIdCookie } from "@/lib/support/routing/branch-cookie";
import {
  getOrgAdminLandingPath,
  getPostLoginPath,
} from "@/lib/support/auth/post-login-route";
import { resolvePostAuthPath } from "@/lib/support/auth/resolve-post-auth-path";
import { isOrgLessUser } from "@/lib/support/auth/org-less-user";
import {
  ROLE_ADMIN,
  ROLE_PLATFORM_OPERATOR,
  ROLE_USER,
  type SessionRole,
} from "@/lib/types/roles";
import {
  isOrgPackageCode,
  orgPackagePath,
  orgPackageReasonFromCode,
} from "@/lib/support/auth/org-package";
import type { ApiError } from "@/types/api";

/**
 * Đích điều hướng sau đăng nhập / đăng ký / rời shell org-less.
 * - User chưa có org → `/discover` hoặc `/join-request` (pending)
 * - User đã có org → dashboard chi nhánh (hoặc workspace nếu chưa chọn chi nhánh)
 */
export async function resolveAppLandingPath(
  role: SessionRole | null | undefined,
  orgId: string | null | undefined,
  branchId?: string | null
): Promise<string> {
  const effectiveBranchId = branchId ?? readFoundationSession().selectedLocationId ?? null;

  if (role === ROLE_PLATFORM_OPERATOR) {
    return getPostLoginPath(ROLE_PLATFORM_OPERATOR);
  }

  if (isOrgLessUser(role, orgId)) {
    return resolvePostAuthPath(role, orgId, effectiveBranchId);
  }

  if (!orgId) return getPostLoginPath(role);

  if (role === ROLE_ADMIN) {
    try {
      const stats = await fetchStats.org();
      return getOrgAdminLandingPath(orgId, stats.locationCount, effectiveBranchId);
    } catch (error: unknown) {
      const code = (error as ApiError)?.messageCode;
      if (isOrgPackageCode(code)) {
        return orgPackagePath(orgPackageReasonFromCode(code));
      }
      return getPostLoginPath(ROLE_ADMIN, orgId, effectiveBranchId);
    }
  }

  if (role === ROLE_USER && !effectiveBranchId) {
    try {
      const membership = await fetchLocationMembership.getMy();
      if (membership?.locationId) {
        setBranchIdCookie(membership.locationId);
        writeFoundationSession({ selectedLocationId: membership.locationId });
        return getPostLoginPath(ROLE_USER, orgId, membership.locationId);
      }
    } catch {
      // chưa có employee / membership
    }
  }

  if (effectiveBranchId) setBranchIdCookie(effectiveBranchId);
  return getPostLoginPath(role, orgId, effectiveBranchId);
}
