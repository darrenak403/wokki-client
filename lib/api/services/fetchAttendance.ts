import { assertEmployeeSuccess } from "@/lib/support/employee/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type { AttendanceResponse, ClockInRequest } from "@/types/employee";

export const fetchAttendance = {
  clockIn: async (data: ClockInRequest = {}): Promise<AttendanceResponse> => {
    const response = await apiService.post<ApiEnvelope<AttendanceResponse>>(
      "api/v1/attendance/clock-in",
      data,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  clockOut: async (): Promise<AttendanceResponse> => {
    const response = await apiService.post<ApiEnvelope<AttendanceResponse>>(
      "api/v1/attendance/clock-out",
      {},
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },
};
