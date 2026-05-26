import { assertFoundationSuccess } from "@/lib/support/foundation/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  CreateLocationRequest,
  LocationSchedulingPolicyResponse,
  LocationResponse,
  UpdateLocationRequest,
  UpsertLocationSchedulingPolicyRequest,
} from "@/types/foundation";

export const fetchLocations = {
  list: async (): Promise<LocationResponse[]> => {
    const response = await apiService.get<ApiEnvelope<LocationResponse[]>>("api/v1/locations");
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  listActive: async (): Promise<LocationResponse[]> => {
    const response = await apiService.get<ApiEnvelope<LocationResponse[]>>("api/v1/locations/available");
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  create: async (data: CreateLocationRequest): Promise<LocationResponse> => {
    const response = await apiService.post<ApiEnvelope<LocationResponse>>(
      "api/v1/locations",
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  update: async (id: string, data: UpdateLocationRequest): Promise<LocationResponse> => {
    const response = await apiService.put<ApiEnvelope<LocationResponse>>(
      `api/v1/locations/${id}`,
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  getSchedulingPolicy: async (id: string): Promise<LocationSchedulingPolicyResponse> => {
    const response = await apiService.get<ApiEnvelope<LocationSchedulingPolicyResponse>>(
      `api/v1/locations/${id}/scheduling-policy`,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  updateSchedulingPolicy: async (
    id: string,
    data: UpsertLocationSchedulingPolicyRequest,
  ): Promise<LocationSchedulingPolicyResponse> => {
    const response = await apiService.put<ApiEnvelope<LocationSchedulingPolicyResponse>>(
      `api/v1/locations/${id}/scheduling-policy`,
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },
};
