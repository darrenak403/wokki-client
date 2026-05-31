import { deleteCookie } from "cookies-next";
import { store } from "@/lib/redux/store";
import { logout } from "@/lib/redux/slices/authSlice";
import {
  orgPackagePath,
  orgPackageReasonFromCode,
  type OrgPackageReason,
} from "@/lib/support/auth/org-package";
import { getAuthCookieConfig } from "@/utils/cookieConfig";

let handling = false;

/** Clear org session and show package gate (all org users blocked until Wokki admin renews). */
export function handleOrgPackageBlock(code?: string | null, reason?: OrgPackageReason) {
  if (typeof window === "undefined" || handling) return;
  if (window.location.pathname.startsWith("/org-package")) return;

  handling = true;
  const targetPath = orgPackagePath(reason ?? orgPackageReasonFromCode(code));

  const cfg = getAuthCookieConfig();
  deleteCookie("authToken", cfg);
  deleteCookie("authRole", cfg);
  store.dispatch(logout());

  window.location.replace(targetPath);
}
