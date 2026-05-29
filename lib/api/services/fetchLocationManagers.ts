import apiService from "@/lib/api/core";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import { assertMembershipSuccess } from "@/lib/support/membership/assert-success";
import type { ApiEnvelope } from "@/types/api";
import type { LocationResponse } from "@/types/foundation";
import type {
  AssignLocationManagerRequest,
  LocationManagerResponse,
} from "@/types/location-membership";

export const fetchLocationManagers = {
  list: async (locationId: string): Promise<LocationManagerResponse[]> => {
    const response = await apiService.get<ApiEnvelope<LocationManagerResponse[]>>(
      `api/v1/locations/${locationId}/managers`
    );
    return assertMembershipSuccess(normalizeApiResponse(response.data));
  },

  assign: async (
    locationId: string,
    data: AssignLocationManagerRequest
  ): Promise<LocationManagerResponse> => {
    const response = await apiService.post<ApiEnvelope<LocationManagerResponse>>(
      `api/v1/locations/${locationId}/managers`,
      data
    );
    return assertMembershipSuccess(normalizeApiResponse(response.data));
  },

  remove: async (locationId: string, userId: string): Promise<void> => {
    const response = await apiService.delete<ApiEnvelope<Record<string, never> | null>>(
      `api/v1/locations/${locationId}/managers/${userId}`
    );
    const normalized = normalizeApiResponse(response.data);
    if (!normalized.success) assertMembershipSuccess(normalized);
  },

  myLocations: async (): Promise<LocationResponse[]> => {
    const response = await apiService.get<ApiEnvelope<LocationResponse[]>>(
      "api/v1/managers/me/locations"
    );
    return assertMembershipSuccess(normalizeApiResponse(response.data));
  },
};
