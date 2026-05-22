import { assertEmployeeSuccess } from "@/lib/support/employee/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type { PagedResponse } from "@/types/foundation";
import type {
  CreateSwapRequest,
  SwapActionRequest,
  SwapListParams,
  SwapRequestResponse,
} from "@/types/employee";

function swapListQuery(params: SwapListParams): Record<string, string | number> {
  const q: Record<string, string | number> = {};
  if (params.page != null) q.page = params.page;
  if (params.pageSize != null) q.pageSize = params.pageSize;
  if (params.status != null) q.status = params.status;
  if (params.departmentId) q.departmentId = params.departmentId;
  if (params.weekStartDate) q.weekStartDate = params.weekStartDate;
  return q;
}

export const fetchSwapRequests = {
  list: async (params: SwapListParams = {}): Promise<PagedResponse<SwapRequestResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<SwapRequestResponse>>>(
      "api/v1/swap-requests",
      swapListQuery(params),
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },
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

  overrideApprove: async (
    swapId: string,
    data: SwapActionRequest = {},
  ): Promise<SwapRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<SwapRequestResponse>>(
      `api/v1/swap-requests/${swapId}/override-approve`,
      data,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  overrideReject: async (
    swapId: string,
    data: SwapActionRequest = {},
  ): Promise<SwapRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<SwapRequestResponse>>(
      `api/v1/swap-requests/${swapId}/override-reject`,
      data,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },
};
