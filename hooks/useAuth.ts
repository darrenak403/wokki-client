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
import { clearBranchIdCookie, setBranchIdCookie } from "@/lib/support/routing/branch-cookie";
import { fetchLocationMembership } from "@/lib/api/services/fetchLocationMembership";
import {
  getOrgAdminLandingPath,
  getPostLoginPath,
} from "@/lib/support/auth/post-login-route";
import {
  isAppRole,
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_PLATFORM_OPERATOR,
  ROLE_USER,
} from "@/lib/types/roles";
import {
  isOrgPackageCode,
  orgPackagePath,
  orgPackageReasonFromCode,
} from "@/lib/support/auth/org-package";
import type { ApiError } from "@/types/api";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/types/auth";

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

  const resolveLandingPath = async (loginUser?: AuthUser | null) => {
    const effectiveRole = loginUser?.role ?? sessionRole;
    const effectiveAppRole = isAppRole(effectiveRole) ? effectiveRole : null;
    const orgId = loginUser?.organizationId ?? organizationId ?? user?.organizationId ?? null;
    const branchId = readFoundationSession().selectedLocationId;

    if (effectiveRole === ROLE_PLATFORM_OPERATOR) {
      return getPostLoginPath(ROLE_PLATFORM_OPERATOR);
    }

    if (!orgId) return getPostLoginPath(effectiveRole);

    if (effectiveAppRole === ROLE_ADMIN) {
      try {
        const stats = await fetchStats.org();
        return getOrgAdminLandingPath(orgId, stats.locationCount, branchId);
      } catch (error: unknown) {
        const code = (error as ApiError)?.messageCode;
        if (isOrgPackageCode(code)) {
          return orgPackagePath(orgPackageReasonFromCode(code));
        }
        return getPostLoginPath(ROLE_ADMIN, orgId, branchId);
      }
    }

    if (effectiveAppRole === ROLE_USER && !branchId) {
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
    return getPostLoginPath(effectiveRole, orgId, branchId);
  };

  const login = async (credentials: LoginRequest) => {
    dispatch(clearError());
    try {
      const result = await dispatch(loginAsync(credentials)).unwrap();

      if (result.token) {
        setupAutoRefresh(result.token, dispatch);
      }

      toast.success("Đăng nhập thành công");
      router.replace(await resolveLandingPath(result.user));

      return result;
    } catch (message: unknown) {
      if (typeof message === "string" && isOrgPackageCode(message)) {
        throw message;
      }
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

      await dispatch(logoutAsync());
      throw "ORG_PACKAGE_NOT_ACTIVATED";
    } catch (message: unknown) {
      if (typeof message === "string" && isOrgPackageCode(message)) {
        throw message;
      }
      const text = typeof message === "string" ? message : "Đăng ký thất bại";
      toast.error(text);
      throw message;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      clearBranchIdCookie();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("logout"));
      }
      toast.success("Đăng xuất thành công");
      router.replace("/login");
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
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
    organizationId,
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
