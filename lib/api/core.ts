/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { deleteCookie } from "cookies-next";
import { getApiBaseUrl } from "@/lib/api/get-api-base-url";
import { extractApiMessage, normalizeApiResponse } from "@/lib/api/normalize-response";
import type { ApiEnvelope, ApiError, RequestParams } from "@/types/api";
import type { AuthTokenPair } from "@/types/auth";

let store: any;
export const injectStore = (_store: any) => {
  store = _store;
};

/** Cancel in-flight refresh queue — call after a fresh login. */
export function resetAuthRefreshState(): void {
  apiService.resetAuthRefreshState();
}

/** Login/register must surface 401 credentials errors — not trigger refresh flow. */
function shouldSkipTokenRefresh(url?: string): boolean {
  if (!url) return false;
  const path = url.split("?")[0]?.replace(/^\//, "") ?? "";
  return (
    path.endsWith("api/v1/auth/login") ||
    path.endsWith("api/v1/auth/register") ||
    path.endsWith("api/v1/auth/refresh-token") ||
    path.includes("api/v1/auth/forgot-password")
  );
}

class ApiService {
  private client: AxiosInstance | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  private getClient(): AxiosInstance {
    if (!this.client) {
      this.client = axios.create({
        baseURL: getApiBaseUrl(),
        timeout: 600000,
        headers: { "Content-Type": "application/json" },
      });
      this.setupInterceptors(this.client);
    }
    return this.client;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token!);
    });
    this.failedQueue = [];
  }

  resetAuthRefreshState() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  private setupInterceptors(client: AxiosInstance) {
    client.interceptors.request.use(
      (config) => {
        const token = store?.getState()?.auth?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        if (config.data instanceof FormData) delete config.headers["Content-Type"];
        return config;
      },
      (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipTokenRefresh(originalRequest.url)) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers["Authorization"] = "Bearer " + token;
                return this.getClient()(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;
          const refreshTokenAtStart = store?.getState()?.auth?.refreshToken;

          try {
            const refreshToken = refreshTokenAtStart;
            if (!refreshToken) throw new Error("No refresh token");

            const accessToken = store?.getState()?.auth?.token;
            const response = await axios.post<ApiEnvelope<AuthTokenPair>>(
              `${getApiBaseUrl()}api/v1/auth/refresh-token`,
              { refreshToken },
              {
                headers: {
                  "Content-Type": "application/json",
                  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
              }
            );

            const normalized = normalizeApiResponse(response.data);

            if (normalized.success && normalized.data?.accessToken) {
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                normalized.data;

              const { setTokenWithRefresh } = await import("@/lib/redux/slices/authSlice");
              const { setCookie } = await import("cookies-next");
              const { getAuthCookieConfig } = await import("@/utils/cookieConfig");

              if (store) {
                store.dispatch(
                  setTokenWithRefresh({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                  })
                );
              }
              const { syncRoleCookie } = await import("@/lib/support/auth/session-cookies");
              const { userFromToken } = await import("@/lib/support/auth/jwt-roles");
              setCookie("authToken", newAccessToken, getAuthCookieConfig());
              syncRoleCookie(userFromToken(newAccessToken)?.role);

              this.processQueue(null, newAccessToken);
              this.isRefreshing = false;

              originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
              return this.getClient()(originalRequest);
            }

            throw new Error("Invalid refresh response");
          } catch (refreshError) {
            this.isRefreshing = false;
            this.processQueue(refreshError, null);

            const sessionChanged =
              refreshTokenAtStart &&
              store?.getState()?.auth?.refreshToken !== refreshTokenAtStart;

            if (!sessionChanged && store) {
              import("@/lib/redux/slices/authSlice").then(({ logout }) => {
                store.dispatch(logout());
              });
              const { clearSessionCookies } = await import("@/lib/support/auth/session-cookies");
              clearSessionCookies();

              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("logout"));
              }
            }

            return Promise.reject({
              httpStatus: 401,
              messageCode: "AUTH_NOT_LOGGED_IN",
              message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
              status: false,
            } as ApiError);
          }
        }

        const errorData = error.response?.data as ApiEnvelope<unknown> | undefined;
        const parsedMessage = extractApiMessage(errorData?.message);
        const validationErrors = Array.isArray(errorData?.errors) ? errorData.errors : undefined;

        const apiError: ApiError = {
          httpStatus: error.response?.status,
          message: parsedMessage.text || error.message || "Có lỗi xảy ra",
          messageCode: parsedMessage.code || undefined,
          status: false,
          errors: validationErrors ?? undefined,
          data: errorData,
        };

        return Promise.reject(apiError);
      }
    );
  }

  setAuthToken(token: string | null) {
    const client = this.getClient();
    if (token) {
      client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete client.defaults.headers.common.Authorization;
    }
  }

  async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getClient().request<T>(config);
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: "GET", url, params });
  }

  async post<T, D = any>(url: string, data?: D): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: "POST", url, data });
  }

  async put<T, D = any>(url: string, data?: D): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: "PUT", url, data });
  }

  async patch<T, D = any>(url: string, data?: D): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: "PATCH", url, data });
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: "DELETE", url });
  }

  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: "POST",
      url,
      data: formData,
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
  }
}

const apiService = new ApiService();

export default apiService;
export type { ApiError, RequestParams };
