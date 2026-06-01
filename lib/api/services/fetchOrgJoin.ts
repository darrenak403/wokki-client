import type { ApiEnvelope, ApiResponse } from "@/types/api";
import type { PagedResponse } from "@/types/foundation";
import type {
  ApproveOrgJoinRequest,
  OrganizationDirectoryItem,
  OrgJoinRequestResponse,
  PendingOrgJoinRequestResponse,
  RejectOrgJoinRequest,
  SubmitOrgJoinRequest,
} from "@/types/org-join";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "../core";

export const fetchOrgJoin = {
  listDirectory: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ApiResponse<PagedResponse<OrganizationDirectoryItem>>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<OrganizationDirectoryItem>>>(
      "api/v1/organizations/directory",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      }
    );
    return normalizeApiResponse(response.data);
  },

  submit: async (data: SubmitOrgJoinRequest): Promise<ApiResponse<OrgJoinRequestResponse>> => {
    const response = await apiService.post<ApiEnvelope<OrgJoinRequestResponse>>(
      "api/v1/org-join-requests",
      data
    );
    return normalizeApiResponse(response.data);
  },

  getMe: async (): Promise<ApiResponse<OrgJoinRequestResponse>> => {
    const response = await apiService.get<ApiEnvelope<OrgJoinRequestResponse>>(
      "api/v1/org-join-requests/me"
    );
    return normalizeApiResponse(response.data);
  },

  cancelMe: async (): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiService.delete<ApiEnvelope<Record<string, never>>>(
      "api/v1/org-join-requests/me"
    );
    return normalizeApiResponse(response.data);
  },

  listPending: async (): Promise<ApiResponse<PendingOrgJoinRequestResponse[]>> => {
    const response = await apiService.get<ApiEnvelope<PendingOrgJoinRequestResponse[]>>(
      "api/v1/org-join-requests/pending"
    );
    return normalizeApiResponse(response.data);
  },

  approve: async (
    id: string,
    data: ApproveOrgJoinRequest
  ): Promise<ApiResponse<OrgJoinRequestResponse>> => {
    const response = await apiService.patch<ApiEnvelope<OrgJoinRequestResponse>>(
      `api/v1/org-join-requests/${id}/approve`,
      data
    );
    return normalizeApiResponse(response.data);
  },

  reject: async (
    id: string,
    data: RejectOrgJoinRequest
  ): Promise<ApiResponse<OrgJoinRequestResponse>> => {
    const response = await apiService.patch<ApiEnvelope<OrgJoinRequestResponse>>(
      `api/v1/org-join-requests/${id}/reject`,
      data
    );
    return normalizeApiResponse(response.data);
  },
};
