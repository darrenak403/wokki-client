import { assertScheduleSuccess } from "@/lib/support/schedule/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type { PagedResponse } from "@/types/foundation";
import type {
  ApplySuggestionsRequest,
  CopyScheduleRequest,
  CreateAssignmentRequest,
  CreateScheduleRequest,
  ScheduleDetailResponse,
  ScheduleListParams,
  ScheduleResponse,
  ShiftAssignmentResponse,
  SuggestScheduleResponse,
  UpdateScheduleRequest,
} from "@/types/schedule";

export const fetchSchedules = {
  list: async (params: ScheduleListParams = {}): Promise<PagedResponse<ScheduleResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<ScheduleResponse>>>(
      "api/v1/schedules",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        ...(params.departmentId ? { departmentId: params.departmentId } : {}),
        ...(params.weekStartDate ? { weekStartDate: params.weekStartDate } : {}),
      },
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  create: async (data: CreateScheduleRequest): Promise<ScheduleResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleResponse>>(
      "api/v1/schedules",
      data,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  getById: async (scheduleId: string): Promise<ScheduleDetailResponse> => {
    const response = await apiService.get<ApiEnvelope<ScheduleDetailResponse>>(
      `api/v1/schedules/${scheduleId}`,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  update: async (scheduleId: string, data: UpdateScheduleRequest): Promise<ScheduleResponse> => {
    const response = await apiService.put<ApiEnvelope<ScheduleResponse>>(
      `api/v1/schedules/${scheduleId}`,
      data,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  delete: async (scheduleId: string): Promise<void> => {
    const response = await apiService.delete<ApiEnvelope<unknown>>(`api/v1/schedules/${scheduleId}`);
    assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  listAssignments: async (scheduleId: string): Promise<ShiftAssignmentResponse[]> => {
    const response = await apiService.get<ApiEnvelope<ShiftAssignmentResponse[]>>(
      `api/v1/schedules/${scheduleId}/assignments`,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  createAssignment: async (
    scheduleId: string,
    data: CreateAssignmentRequest,
  ): Promise<ShiftAssignmentResponse> => {
    const response = await apiService.post<ApiEnvelope<ShiftAssignmentResponse>>(
      `api/v1/schedules/${scheduleId}/assignments`,
      data,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  deleteAssignment: async (scheduleId: string, assignmentId: string): Promise<void> => {
    const response = await apiService.delete<ApiEnvelope<unknown>>(
      `api/v1/schedules/${scheduleId}/assignments/${assignmentId}`,
    );
    assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  suggest: async (scheduleId: string): Promise<SuggestScheduleResponse> => {
    const response = await apiService.post<ApiEnvelope<SuggestScheduleResponse>>(
      `api/v1/schedules/${scheduleId}/suggest`,
      {},
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  applySuggestions: async (
    scheduleId: string,
    data: ApplySuggestionsRequest,
  ): Promise<ShiftAssignmentResponse[]> => {
    const response = await apiService.post<ApiEnvelope<ShiftAssignmentResponse[]>>(
      `api/v1/schedules/${scheduleId}/apply-suggestions`,
      data,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  publish: async (scheduleId: string): Promise<ScheduleResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleResponse>>(
      `api/v1/schedules/${scheduleId}/publish`,
      {},
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  unpublish: async (scheduleId: string): Promise<ScheduleResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleResponse>>(
      `api/v1/schedules/${scheduleId}/unpublish`,
      {},
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  copy: async (scheduleId: string, data: CopyScheduleRequest): Promise<ScheduleResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleResponse>>(
      `api/v1/schedules/${scheduleId}/copy`,
      data,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },
};
