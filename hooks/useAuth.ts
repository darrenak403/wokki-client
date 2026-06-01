"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  clearError,
  loginAsync,
  logoutAsync,
  registerAsync,
  registerEmployeeAsync,
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
import { readFoundationSession } from "@/lib/support/foundation/session-context";
import { clearBranchIdCookie } from "@/lib/support/routing/branch-cookie";
import { resolveAppLandingPath } from "@/lib/support/auth/resolve-app-landing-path";
import {
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_PLATFORM_OPERATOR,
} from "@/lib/types/roles";
import { isOrgPackageCode } from "@/lib/support/auth/org-package";
import type { AuthUser, LoginRequest, RegisterEmployeeRequest, RegisterRequest } from "@/types/auth";

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
    const orgId = loginUser?.organizationId ?? organizationId ?? user?.organizationId ?? null;
    const branchId = readFoundationSession().selectedLocationId;
    return resolveAppLandingPath(effectiveRole, orgId, branchId);
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

  const registerEmployee = async (credentials: RegisterEmployeeRequest) => {
    dispatch(clearError());
    try {
      const result = await dispatch(registerEmployeeAsync(credentials)).unwrap();

      if (result.token) {
        setupAutoRefresh(result.token, dispatch);
      }

      toast.success("Đăng ký thành công");
      router.replace(await resolveAppLandingPath(result.user.role, result.user.organizationId));

      return result;
    } catch (message: unknown) {
      const text = typeof message === "string" ? message : "Đăng ký thất bại";
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
    registerEmployee,
    logout,
    clearError: () => dispatch(clearError()),
  };
}
