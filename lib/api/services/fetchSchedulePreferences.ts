import { assertSchedulePreferenceSuccess } from "@/lib/support/schedule-preference/assert-success";
import { normalizeScheduleStatus } from "@/lib/support/schedule/normalize-status";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  EmployeeDraftScheduleResponse,
  MySchedulePreferenceResponse,
  SaveSchedulePreferencesRequest,
} from "@/types/schedule-preferences";

export const fetchSchedulePreferences = {
  getScheduleForWeek: async (weekStartDate: string): Promise<EmployeeDraftScheduleResponse | null> => {
    const response = await apiService.get<ApiEnvelope<EmployeeDraftScheduleResponse | null>>(
      `api/v1/self/schedule-preferences/week/${weekStartDate}`,
    );
    const data = assertSchedulePreferenceSuccess(normalizeApiResponse(response.data));
    if (!data) return null;
    return { ...data, status: normalizeScheduleStatus(data.status) };
  },

  getMine: async (scheduleId: string): Promise<MySchedulePreferenceResponse> => {
    const response = await apiService.get<ApiEnvelope<MySchedulePreferenceResponse>>(
      `api/v1/self/schedule-preferences/${scheduleId}`,
    );
    return assertSchedulePreferenceSuccess(normalizeApiResponse(response.data));
  },

  saveMine: async (
    scheduleId: string,
    data: SaveSchedulePreferencesRequest,
  ): Promise<MySchedulePreferenceResponse> => {
    const response = await apiService.put<ApiEnvelope<MySchedulePreferenceResponse>>(
      `api/v1/self/schedule-preferences/${scheduleId}`,
      data,
    );
    return assertSchedulePreferenceSuccess(normalizeApiResponse(response.data));
  },

  submitMine: async (scheduleId: string): Promise<MySchedulePreferenceResponse> => {
    const response = await apiService.post<ApiEnvelope<MySchedulePreferenceResponse>>(
      `api/v1/self/schedule-preferences/${scheduleId}/submit`,
      {},
    );
    return assertSchedulePreferenceSuccess(normalizeApiResponse(response.data));
  },
};
