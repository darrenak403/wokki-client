import { assertScheduleSuccess } from "@/lib/support/schedule/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  CreateScheduleLeaveRequest,
  ScheduleLeaveRequestResponse,
} from "@/types/schedule-leave";

export const fetchLeaveRequests = {
  createMine: async (
    data: CreateScheduleLeaveRequest,
  ): Promise<ScheduleLeaveRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleLeaveRequestResponse>>(
      "api/v1/self/leave-requests",
      data,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  listMine: async (scheduleId?: string): Promise<ScheduleLeaveRequestResponse[]> => {
    const response = await apiService.get<ApiEnvelope<ScheduleLeaveRequestResponse[]>>(
      "api/v1/self/leave-requests",
      scheduleId ? { scheduleId } : undefined,
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  cancelMine: async (id: string): Promise<void> => {
    await apiService.delete(`api/v1/self/leave-requests/${id}`);
  },

  listForReview: async (
    scheduleId: string,
    status?: string,
  ): Promise<ScheduleLeaveRequestResponse[]> => {
    const response = await apiService.get<ApiEnvelope<ScheduleLeaveRequestResponse[]>>(
      "api/v1/leave-requests",
      { scheduleId, ...(status ? { status } : {}) },
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  approve: async (id: string): Promise<ScheduleLeaveRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleLeaveRequestResponse>>(
      `api/v1/leave-requests/${id}/approve`,
      {},
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },

  reject: async (id: string): Promise<ScheduleLeaveRequestResponse> => {
    const response = await apiService.post<ApiEnvelope<ScheduleLeaveRequestResponse>>(
      `api/v1/leave-requests/${id}/reject`,
      {},
    );
    return assertScheduleSuccess(normalizeApiResponse(response.data));
  },
};
