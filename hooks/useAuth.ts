"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  clearError,
  loginAsync,
  logoutAsync,
  registerAsync,
  selectAppRole,
  selectAuth,
  selectAuthError,
  selectAuthLoading,
  selectIsAuthenticated,
  selectIsPlatformOperator,
  selectOrganizationId,
  selectOrganizationName,
  selectUser,
  setupAutoRefresh,
} from "@/lib/redux/slices/authSlice";
import { fetchStats } from "@/lib/api/services/fetchStats";
import { readFoundationSession, writeFoundationSession } from "@/lib/support/foundation/session-context";
import { setBranchIdCookie } from "@/lib/support/routing/branch-cookie";
import { fetchLocationMembership } from "@/lib/api/services/fetchLocationMembership";
import {
  getOrgAdminLandingPath,
  getPostLoginPath,
} from "@/lib/support/auth/post-login-route";
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";
import { buildOrgScopedPath } from "@/lib/support/routing/tenant-routes";
import type { LoginRequest, RegisterRequest } from "@/types/auth";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const role = useAppSelector(selectAppRole);
  const organizationId = useAppSelector(selectOrganizationId);
  const sessionRole = useAppSelector((s) => s.auth.user?.role ?? null);
  const organizationName = useAppSelector(selectOrganizationName);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isPlatformOperator = useAppSelector(selectIsPlatformOperator);

  const isAdmin = role === ROLE_ADMIN;
  const isManager = role === ROLE_MANAGER;

  const resolveLandingPath = async () => {
    const orgId = organizationId ?? user?.organizationId ?? null;
    const branchId = readFoundationSession().selectedLocationId;

    if (isPlatformOperator || sessionRole === "PlatformOperator") {
      return getPostLoginPath("PlatformOperator");
    }

    if (!orgId) return getPostLoginPath(sessionRole);

    if (role === ROLE_ADMIN) {
      try {
        const stats = await fetchStats.org();
        return getOrgAdminLandingPath(orgId, stats.locationCount, branchId);
      } catch {
        return getPostLoginPath(ROLE_ADMIN, orgId, branchId);
      }
    }

    if (role === ROLE_USER && !branchId) {
      try {
        const membership = await fetchLocationMembership.getMy();
        if (membership?.locationId) {
          setBranchIdCookie(membership.locationId);
          writeFoundationSession({ selectedLocationId: membership.locationId });
          return getPostLoginPath(ROLE_USER, orgId, membership.locationId);
        }
      } catch {
        // no employee profile
      }
    }

    if (branchId) setBranchIdCookie(branchId);
    return getPostLoginPath(sessionRole, orgId, branchId);
  };

  const login = async (credentials: LoginRequest) => {
    dispatch(clearError());
    try {
      const result = await dispatch(loginAsync(credentials)).unwrap();

      if (result.token) {
        setupAutoRefresh(result.token, dispatch);
      }

      toast.success("Đăng nhập thành công");
      router.replace(await resolveLandingPath());

      return result;
    } catch (message: unknown) {
      const text = typeof message === "string" ? message : "Đăng nhập thất bại";
      toast.error(text);
      throw message;
    }
  };

  const register = async (credentials: RegisterRequest) => {
    dispatch(clearError());
    try {
      const result = await dispatch(registerAsync(credentials)).unwrap();

      if (result.token) {
        setupAutoRefresh(result.token, dispatch);
      }

      toast.success("Đã tạo tổ chức. Hãy thiết lập chi nhánh đầu tiên.");
      const orgId = result.user?.organizationId ?? organizationId;
      router.replace(
        orgId ? buildOrgScopedPath(orgId, ROLE_ADMIN, "onboarding") : "/login"
      );

      return result;
    } catch (message: unknown) {
      const text = typeof message === "string" ? message : "Đăng ký thất bại";
      toast.error(text);
      throw message;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      toast.success("Đăng xuất thành công");
      router.push("/login");
    } catch {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  return {
    ...auth,
    user,
    role,
    sessionRole,
    organizationName,
    isAdmin,
    isManager,
    isPlatformOperator,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError: () => dispatch(clearError()),
  };
}
