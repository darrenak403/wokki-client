"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  clearError,
  loginAsync,
  logoutAsync,
  selectAuth,
  selectAuthError,
  selectAuthLoading,
  selectIsAuthenticated,
  selectUser,
  selectUserRole,
  setupAutoRefresh,
} from "@/lib/redux/slices/authSlice";
import { getPostLoginPath } from "@/lib/auth/routing";
import { userFromToken } from "@/lib/auth/jwt-roles";
import { normalizeAppRole } from "@/lib/auth/normalize-role";
import { ROLE_USER } from "@/lib/types/roles";
import { ROLE_ADMIN, ROLE_MANAGER } from "@/lib/types/roles";
import type { LoginRequest } from "@/types/auth";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const role = useAppSelector(selectUserRole);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isAdmin = role === ROLE_ADMIN;
  const isManager = role === ROLE_MANAGER;

  const login = async (credentials: LoginRequest) => {
    dispatch(clearError());
    try {
      const result = await dispatch(loginAsync(credentials)).unwrap();

      if (result.token) {
        setupAutoRefresh(result.token, dispatch);
      }

      toast.success("Đăng nhập thành công");

      const role =
        normalizeAppRole(result.user?.role) ??
        userFromToken(result.token)?.role ??
        ROLE_USER;

      router.replace(getPostLoginPath(role));

      return result;
    } catch (message: unknown) {
      const text = typeof message === "string" ? message : "Đăng nhập thất bại";
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
    isAdmin,
    isManager,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError: () => dispatch(clearError()),
  };
}
