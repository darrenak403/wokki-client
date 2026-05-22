import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  RefreshTokenRequest,
} from "@/types/auth";
import type { ApiResponse } from "@/types/api";
import apiService from "../core";

export const fetchAuth = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiService.post<LoginResponse>("api/v1/auth/login", data);
    return response.data;
  },

  getMe: async (): Promise<MeResponse> => {
    const response = await apiService.get<MeResponse>("api/v1/auth/me");
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
    const response = await apiService.post<LoginResponse>("api/v1/auth/refresh-token", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiService.post<ApiResponse<Record<string, never>>>("api/v1/auth/logout", {});
  },

  register: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiService.post<LoginResponse>("api/v1/auth/register", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<unknown>> => {
    const response = await apiService.put<ApiResponse<unknown>>("api/v1/auth/change-password", data);
    return response.data;
  },
};
