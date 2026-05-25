import { assertEmployeeSuccess } from "@/lib/support/employee/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type { PagedResponse } from "@/types/foundation";
import type {
  OvertimeRequestResponse,
  SubmitOvertimeRequestDto,
  OvertimeActionRequest,
  OvertimeListParams,
} from "@/types/overtime";

export const fetchOvertimeRequests = {
  submit: async (data: SubmitOvertimeRequestDto): Promise<OvertimeRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<OvertimeRequestResponse>>(
      "api/v1/overtime-requests",
      data,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  clockOutOT: async (id: string): Promise<OvertimeRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<OvertimeRequestResponse>>(
      `api/v1/overtime-requests/${id}/clock-out`,
      {},
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  listMy: async (params?: {
    shiftAssignmentId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResponse<OvertimeRequestResponse>> => {
    const q: Record<string, string | number> = { page: 1, pageSize: 50 };
    if (params?.shiftAssignmentId) q.shiftAssignmentId = params.shiftAssignmentId;
    if (params?.page != null) q.page = params.page;
    if (params?.pageSize != null) q.pageSize = params.pageSize;
    const response = await apiService.get<ApiEnvelope<PagedResponse<OvertimeRequestResponse>>>(
      "api/v1/overtime-requests/my",
      q,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  listPending: async (
    params?: OvertimeListParams,
  ): Promise<PagedResponse<OvertimeRequestResponse>> => {
    const q: Record<string, string | number> = {};
    if (params?.status != null) q.status = params.status;
    if (params?.departmentId) q.departmentId = params.departmentId;
    if (params?.shiftAssignmentId) q.shiftAssignmentId = params.shiftAssignmentId;
    if (params?.page != null) q.page = params.page;
    if (params?.pageSize != null) q.pageSize = params.pageSize;
    const response = await apiService.get<ApiEnvelope<PagedResponse<OvertimeRequestResponse>>>(
      "api/v1/overtime-requests/pending",
      q,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  approve: async (id: string, data?: OvertimeActionRequest): Promise<OvertimeRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<OvertimeRequestResponse>>(
      `api/v1/overtime-requests/${id}/approve`,
      data ?? {},
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  reject: async (id: string, data?: OvertimeActionRequest): Promise<OvertimeRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<OvertimeRequestResponse>>(
      `api/v1/overtime-requests/${id}/reject`,
      data ?? {},
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },
};
