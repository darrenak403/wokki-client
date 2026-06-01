import { fetchOrgJoin } from "@/lib/api/services/fetchOrgJoin";
import { getPostLoginPath } from "@/lib/support/auth/post-login-route";
import { isOrgLessUser } from "@/lib/support/auth/org-less-user";
import type { SessionRole } from "@/lib/types/roles";

/** Sau login / register-employee — org-less user đi discover hoặc join-request. */
export async function resolvePostAuthPath(
  role: SessionRole | null | undefined,
  organizationId: string | null | undefined,
  locationId?: string | null
): Promise<string> {
  if (isOrgLessUser(role, organizationId)) {
    try {
      const me = await fetchOrgJoin.getMe();
      if (me.success && me.data?.status === "Pending") {
        return "/join-request";
      }
    } catch {
      // no request yet
    }
    return "/discover";
  }

  return getPostLoginPath(role, organizationId, locationId);
}
