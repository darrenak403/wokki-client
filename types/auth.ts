import type { ApiResponse } from "@/types/api";
import type { AppRole } from "@/lib/types/roles";

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
  tokenType?: string;
}

export type LoginResponse = ApiResponse<AuthTokenPair>;

export interface RefreshTokenRequest {
  refreshToken: string;
}

export type MeResponse = ApiResponse<AuthUser>;

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
