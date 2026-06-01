import type { ApiResponse } from "@/types/api";
import type { SessionRole } from "@/lib/types/roles";

export interface AuthUser {
  id: string;
  email: string;
  role: SessionRole;
  organizationId?: string | null;
  mustChangePassword?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  organizationName: string;
}

export interface RegisterEmployeeRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  mustChangePassword?: boolean;
  expiresAt?: string;
  tokenType?: string;
}

export type LoginResponse = ApiResponse<AuthTokenPair>;

export interface RefreshTokenRequest {
  refreshToken: string;
}

export type MeResponse = ApiResponse<AuthUser>;

export type RegisterResponse = LoginResponse;

/** Đổi mật khẩu khi đã đăng nhập */
export interface ResetPasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type ResetPasswordResponse = ApiResponse<AuthUser>;

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyForgotPasswordOtpRequest {
  email: string;
  otpCode: string;
}

export interface CompleteForgotPasswordRequest {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
}

/** @deprecated use ResetPasswordRequest */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
}

export type ChangePasswordResponse = ResetPasswordResponse;
