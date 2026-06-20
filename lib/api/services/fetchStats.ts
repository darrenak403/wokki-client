import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope, ApiError } from "@/types/api";
import { normalizeOrgStats, normalizeOrgSubscription } from "@/lib/support/org/subscription";
import type {
  OrgStatsResponse,
  OrgSubscriptionResponse,
  OrgUsageAnalyticsParams,
  OrgUsageAnalyticsResponse,
  PlatformStatsResponse,
} from "@/types/stats";

function assertStatsSuccess<T>(response: {
  success: boolean;
  data: T | null;
  message?: { text?: string; code?: string; statusCode?: number };
}): T {
  if (!response.success || response.data == null) {
    const err: ApiError = {
      message: response.message?.text ?? "Không tải được thống kê.",
      messageCode: response.message?.code,
      httpStatus: response.message?.statusCode,
      status: false,
    };
    throw err;
  }
  return response.data;
}

export const fetchStats = {
  org: async (): Promise<OrgStatsResponse> => {
    const response = await apiService.get<ApiEnvelope<OrgStatsResponse>>("api/v1/org/stats");
    const envelope = normalizeApiResponse(response.data);
    const raw = assertStatsSuccess(envelope);
    return normalizeOrgStats(raw);
  },

  platform: async (): Promise<PlatformStatsResponse> => {
    const response = await apiService.get<ApiEnvelope<PlatformStatsResponse>>(
      "api/v1/platform/stats"
    );
    return assertStatsSuccess(normalizeApiResponse(response.data));
  },

  subscription: async (): Promise<OrgSubscriptionResponse> => {
    const response = await apiService.get<ApiEnvelope<OrgSubscriptionResponse>>(
      "api/v1/org/subscription"
    );
    const envelope = normalizeApiResponse(response.data);
    const raw = assertStatsSuccess(envelope);
    return normalizeOrgSubscription(raw);
  },

  orgUsageAnalytics: async (
    params: OrgUsageAnalyticsParams = {}
  ): Promise<OrgUsageAnalyticsResponse> => {
    const response = await apiService.get<ApiEnvelope<OrgUsageAnalyticsResponse>>(
      "api/v1/org/usage-analytics",
      params.windowDays ? { windowDays: params.windowDays } : undefined
    );
    return assertStatsSuccess(normalizeApiResponse(response.data));
  },
};
