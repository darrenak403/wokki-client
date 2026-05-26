import apiService from "@/lib/api/core";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import type { ApiEnvelope, ApiError } from "@/types/api";
import type { LocationMembershipResponse } from "@/types/location-membership";

export const fetchLocationMembership = {
  getMy: async (): Promise<LocationMembershipResponse | null> => {
    const response = await apiService.get<ApiEnvelope<LocationMembershipResponse | null>>(
      "api/v1/location-memberships/my",
    );
    const normalized = normalizeApiResponse(response.data);
    if (!normalized.success) {
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
    return normalized.data;
  },
};
