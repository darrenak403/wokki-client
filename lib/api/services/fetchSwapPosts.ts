import { assertEmployeeSuccess } from "@/lib/support/employee/assert-success";
import {
  normalizeSwapPostAuditResponse,
  normalizeSwapPostResponse,
} from "@/lib/support/employee/normalize-swap-post";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type { PagedResponse } from "@/types/foundation";
import type {
  AcceptSwapPostRequest,
  CreateSwapPostRequest,
  SwapPostAuditResponse,
  SwapPostListParams,
  SwapPostResponse,
} from "@/types/employee";

function listQuery(params: SwapPostListParams): Record<string, string | number> {
  const q: Record<string, string | number> = {};
  if (params.page != null) q.page = params.page;
  if (params.pageSize != null) q.pageSize = params.pageSize;
  if (params.scheduleId) q.scheduleId = params.scheduleId;
  if (params.status != null) q.status = params.status;
  if (params.locationId) q.locationId = params.locationId;
  if (params.departmentId) q.departmentId = params.departmentId;
  if (params.weekStartDate) q.weekStartDate = params.weekStartDate;
  return q;
}

function normalizeSwapPostPage(page: PagedResponse<SwapPostResponse>): PagedResponse<SwapPostResponse> {
  return { ...page, items: page.items.map(normalizeSwapPostResponse) };
}

function normalizeAuditPage(page: PagedResponse<SwapPostAuditResponse>): PagedResponse<SwapPostAuditResponse> {
  return { ...page, items: page.items.map(normalizeSwapPostAuditResponse) };
}

export const fetchSwapPosts = {
  feed: async (params: SwapPostListParams): Promise<PagedResponse<SwapPostResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<SwapPostResponse>>>(
      "api/v1/swap-posts/feed",
      listQuery(params),
    );
    return normalizeSwapPostPage(assertEmployeeSuccess(normalizeApiResponse(response.data)));
  },

  mine: async (params: SwapPostListParams = {}): Promise<PagedResponse<SwapPostResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<SwapPostResponse>>>(
      "api/v1/self/swap-posts/mine",
      listQuery(params),
    );
    return normalizeSwapPostPage(assertEmployeeSuccess(normalizeApiResponse(response.data)));
  },

  create: async (data: CreateSwapPostRequest): Promise<SwapPostResponse> => {
    const response = await apiService.post<ApiEnvelope<SwapPostResponse>>(
      "api/v1/swap-posts",
      data,
    );
    return normalizeSwapPostResponse(assertEmployeeSuccess(normalizeApiResponse(response.data)));
  },

  getById: async (postId: string): Promise<SwapPostResponse> => {
    const response = await apiService.get<ApiEnvelope<SwapPostResponse>>(
      `api/v1/swap-posts/${postId}`,
    );
    return normalizeSwapPostResponse(assertEmployeeSuccess(normalizeApiResponse(response.data)));
  },

  accept: async (postId: string, data: AcceptSwapPostRequest = {}): Promise<SwapPostResponse> => {
    const response = await apiService.post<ApiEnvelope<SwapPostResponse>>(
      `api/v1/swap-posts/${postId}/accept`,
      data,
    );
    return normalizeSwapPostResponse(assertEmployeeSuccess(normalizeApiResponse(response.data)));
  },

  previewAccept: async (
    postId: string,
    data: AcceptSwapPostRequest = {},
  ): Promise<{ isValid: boolean; errorCode: string | null; errorMessage: string | null }> => {
    const response = await apiService.post<
      ApiEnvelope<{ isValid: boolean; errorCode: string | null; errorMessage: string | null }>
    >(`api/v1/swap-posts/${postId}/accept/preview`, data);
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  cancel: async (postId: string): Promise<SwapPostResponse> => {
    const response = await apiService.post<ApiEnvelope<SwapPostResponse>>(
      `api/v1/swap-posts/${postId}/cancel`,
      {},
    );
    return normalizeSwapPostResponse(assertEmployeeSuccess(normalizeApiResponse(response.data)));
  },

  audit: async (params: SwapPostListParams = {}): Promise<PagedResponse<SwapPostAuditResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<SwapPostAuditResponse>>>(
      "api/v1/swap-posts/audit",
      listQuery(params),
    );
    return normalizeAuditPage(assertEmployeeSuccess(normalizeApiResponse(response.data)));
  },

  adminFeed: async (params: SwapPostListParams = {}): Promise<PagedResponse<SwapPostResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<SwapPostResponse>>>(
      "api/v1/swap-posts/admin/feed",
      listQuery(params),
    );
    return normalizeSwapPostPage(assertEmployeeSuccess(normalizeApiResponse(response.data)));
  },
};
