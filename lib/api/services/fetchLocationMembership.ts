import apiService from "@/lib/api/core";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import type { ApiEnvelope, ApiError } from "@/types/api";
import type { LocationMembershipResponse } from "@/types/location-membership";

function throwApiError(normalized: ReturnType<typeof normalizeApiResponse>): never {
  const err = Object.assign(
    new Error(normalized.message?.text ?? "Lỗi không xác định"),
    {
      httpStatus: normalized.message?.statusCode ?? 500,
      status: false as const,
      messageCode: normalized.message?.code,
    } satisfies Partial<ApiError>,
  );
  throw err;
}

export const fetchLocationMembership = {
  getMy: async (): Promise<LocationMembershipResponse | null> => {
    const response = await apiService.get<ApiEnvelope<LocationMembershipResponse | null>>(
      "api/v1/location-memberships/my",
    );
    const normalized = normalizeApiResponse(response.data);
    if (!normalized.success) throwApiError(normalized);
    return normalized.data;
  },

  request: async (locationId: string): Promise<LocationMembershipResponse> => {
    const response = await apiService.post<ApiEnvelope<LocationMembershipResponse>>(
      "api/v1/location-memberships/request",
      { locationId },
    );
    const normalized = normalizeApiResponse(response.data);
    if (!normalized.success || !normalized.data) throwApiError(normalized);
    return normalized.data!;
  },
};
