import type {
  AuthTokenPair,
  AuthUser,
  CompleteForgotPasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyForgotPasswordOtpRequest,
} from "@/types/auth";
import type { ApiEnvelope, ApiResponse } from "@/types/api";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "../core";

export const fetchAuth = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiService.post<ApiEnvelope<AuthTokenPair>>("api/v1/auth/login", data);
    return normalizeApiResponse(response.data);
  },

  getMe: async (): Promise<MeResponse> => {
    const response = await apiService.get<ApiEnvelope<AuthUser>>("api/v1/auth/me");
    return normalizeApiResponse(response.data);
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
    const response = await apiService.post<ApiEnvelope<AuthTokenPair>>(
      "api/v1/auth/refresh-token",
      data
    );
    return normalizeApiResponse(response.data);
  },

  logout: async (): Promise<void> => {
    await apiService.post<ApiEnvelope<Record<string, never>>>("api/v1/auth/logout", {});
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiService.post<ApiEnvelope<AuthTokenPair>>(
      "api/v1/auth/register",
      data
    );
    return normalizeApiResponse(response.data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await apiService.post<ApiEnvelope<AuthUser>>(
      "api/v1/auth/reset-password",
      data
    );
    return normalizeApiResponse(response.data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<boolean>> => {
    const response = await apiService.post<ApiEnvelope<boolean>>(
      "api/v1/auth/forgot-password",
      data
    );
    return normalizeApiResponse(response.data);
  },

  verifyForgotPasswordOtp: async (
    data: VerifyForgotPasswordOtpRequest
  ): Promise<ApiResponse<boolean>> => {
    const response = await apiService.post<ApiEnvelope<boolean>>(
      "api/v1/auth/forgot-password/verify-otp",
      data
    );
    return normalizeApiResponse(response.data);
  },

  completeForgotPassword: async (
    data: CompleteForgotPasswordRequest
  ): Promise<ApiResponse<boolean>> => {
    const response = await apiService.post<ApiEnvelope<boolean>>(
      "api/v1/auth/forgot-password/complete",
      data
    );
    return normalizeApiResponse(response.data);
  },
};
