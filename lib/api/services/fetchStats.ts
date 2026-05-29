import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type { OrgStatsResponse, PlatformStatsResponse } from "@/types/stats";

function assertStatsSuccess<T>(response: { success: boolean; data: T | null; message?: { text?: string } }): T {
  if (!response.success || response.data == null) {
    throw new Error(response.message?.text ?? "Không tải được thống kê.");
  }
  return response.data;
}

export const fetchStats = {
  org: async (): Promise<OrgStatsResponse> => {
    const response = await apiService.get<ApiEnvelope<OrgStatsResponse>>("api/v1/org/stats");
    return assertStatsSuccess(normalizeApiResponse(response.data));
  },

  platform: async (): Promise<PlatformStatsResponse> => {
    const response = await apiService.get<ApiEnvelope<PlatformStatsResponse>>(
      "api/v1/platform/stats"
    );
    return assertStatsSuccess(normalizeApiResponse(response.data));
  },
};
