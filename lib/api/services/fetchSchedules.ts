import { assertScheduleSuccess } from "@/lib/support/schedule/assert-success";
import {
  normalizeScheduleDetail,
  normalizeScheduleResponse,
} from "@/lib/support/schedule/normalize-schedule-payload";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type { PagedResponse } from "@/types/foundation";
import type { SchedulePreferenceBoardResponse } from "@/types/schedule-preferences";
import type {
  ApplySuggestionsRequest,
  CopyScheduleRequest,
  CreateAssignmentRequest,
  CreateScheduleRequest,
  ScheduleDetailResponse,
  GenerateScheduleInsightContextRequest,
  MoveAssignmentRequest,
  ScheduleInsightChatRequest,
  ScheduleInsightChatResponse,
  ScheduleInsightContextResponse,
  ScheduleListParams,
  ScheduleResponse,
  ShiftAssignmentResponse,
  SuggestScheduleRequest,
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
    const page = assertScheduleSuccess(normalizeApiResponse(response.data));
    return { ...page, items: page.items.map(normalizeScheduleResponse) };
  },

  create: async (data: CreateScheduleRequest): Promise<ScheduleResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleResponse>>(
      "api/v1/schedules",
      data,
    );
    return normalizeScheduleResponse(assertScheduleSuccess(normalizeApiResponse(response.data)));
  },

  getById: async (scheduleId: string): Promise<ScheduleDetailResponse> => {
    const response = await apiService.get<ApiEnvelope<ScheduleDetailResponse>>(
      `api/v1/schedules/${scheduleId}`,
    );
    return normalizeScheduleDetail(assertScheduleSuccess(normalizeApiResponse(response.data)));
  },

  update: async (scheduleId: string, data: UpdateScheduleRequest): Promise<ScheduleResponse> => {
    const response = await apiService.put<ApiEnvelope<ScheduleResponse>>(
      `api/v1/schedules/${scheduleId}`,
      data,
    );
    return normalizeScheduleResponse(assertScheduleSuccess(normalizeApiResponse(response.data)));
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

  moveAssignment: async (
    scheduleId: string,
    assignmentId: string,
    data: MoveAssignmentRequest,
  ): Promise<ShiftAssignmentResponse> => {
    const response = await apiService.patch<ApiEnvelope<ShiftAssignmentResponse>>(
      `api/v1/schedules/${scheduleId}/assignments/${assignmentId}`,
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

  getPreferenceBoard: async (scheduleId: string): Promise<SchedulePreferenceBoardResponse> => {
    const response = await apiService.get<ApiEnvelope<SchedulePreferenceBoardResponse>>(
      `api/v1/schedules/${scheduleId}/preference-board`,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  suggest: async (
    scheduleId: string,
    body: SuggestScheduleRequest = {},
  ): Promise<SuggestScheduleResponse> => {
    const response = await apiService.post<ApiEnvelope<SuggestScheduleResponse>>(
      `api/v1/schedules/${scheduleId}/suggest`,
      body,
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

  generateInsightContext: async (
    scheduleId: string,
    data: GenerateScheduleInsightContextRequest = {},
  ): Promise<ScheduleInsightContextResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleInsightContextResponse>>(
      `api/v1/schedules/${scheduleId}/insights/context`,
      data,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  getInsightContext: async (scheduleId: string): Promise<ScheduleInsightContextResponse> => {
    const response = await apiService.get<ApiEnvelope<ScheduleInsightContextResponse>>(
      `api/v1/schedules/${scheduleId}/insights/context`,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  chatInsight: async (
    scheduleId: string,
    data: ScheduleInsightChatRequest,
  ): Promise<ScheduleInsightChatResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleInsightChatResponse>>(
      `api/v1/schedules/${scheduleId}/insights/chat`,
      data,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  publish: async (scheduleId: string): Promise<ScheduleResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleResponse>>(
      `api/v1/schedules/${scheduleId}/publish`,
      {},
    );
    return normalizeScheduleResponse(assertScheduleSuccess(normalizeApiResponse(response.data)));
  },

  unpublish: async (scheduleId: string): Promise<ScheduleResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleResponse>>(
      `api/v1/schedules/${scheduleId}/unpublish`,
      {},
    );
    return normalizeScheduleResponse(assertScheduleSuccess(normalizeApiResponse(response.data)));
  },

  copy: async (scheduleId: string, data: CopyScheduleRequest): Promise<ScheduleResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleResponse>>(
      `api/v1/schedules/${scheduleId}/copy`,
      data,
    );
    return normalizeScheduleResponse(assertScheduleSuccess(normalizeApiResponse(response.data)));
  },
};
