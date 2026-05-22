import { assertEmployeeSuccess } from "@/lib/support/employee/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  CreateSwapRequest,
  SwapActionRequest,
  SwapRequestResponse,
} from "@/types/employee";

export const fetchSwapRequests = {
  create: async (data: CreateSwapRequest): Promise<SwapRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<SwapRequestResponse>>(
      "api/v1/swap-requests",
      data,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  getById: async (swapId: string): Promise<SwapRequestResponse> => {
    const response = await apiService.get<ApiEnvelope<SwapRequestResponse>>(
      `api/v1/swap-requests/${swapId}`,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  accept: async (swapId: string, data: SwapActionRequest = {}): Promise<SwapRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<SwapRequestResponse>>(
      `api/v1/swap-requests/${swapId}/accept`,
      data,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  decline: async (swapId: string, data: SwapActionRequest = {}): Promise<SwapRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<SwapRequestResponse>>(
      `api/v1/swap-requests/${swapId}/decline`,
      data,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  cancel: async (swapId: string, data: SwapActionRequest = {}): Promise<SwapRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<SwapRequestResponse>>(
      `api/v1/swap-requests/${swapId}/cancel`,
      data,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },
};
