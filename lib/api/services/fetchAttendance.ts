import { assertEmployeeSuccess } from "@/lib/support/employee/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type { PagedResponse } from "@/types/foundation";
import type {
  AdjustAttendanceRequest,
  AttendanceDailySummaryParams,
  AttendanceDailySummaryResponse,
  AttendanceResponse,
  ClockInRequest,
  TeamAttendanceListParams,
} from "@/types/employee";

function teamAttendanceQuery(params: TeamAttendanceListParams): Record<string, string | number> {
  const q: Record<string, string | number> = {};
  if (params.page != null) q.page = params.page;
  if (params.pageSize != null) q.pageSize = params.pageSize;
  if (params.employeeId) q.employeeId = params.employeeId;
  if (params.fromDate) q.fromDate = params.fromDate;
  if (params.toDate) q.toDate = params.toDate;
  if (params.mode != null) q.mode = params.mode;
  return q;
}

export const fetchAttendance = {
  list: async (
    params: TeamAttendanceListParams = {},
  ): Promise<PagedResponse<AttendanceResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<AttendanceResponse>>>(
      "api/v1/attendance",
      teamAttendanceQuery(params),
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  adjust: async (
    attendanceId: string,
    data: AdjustAttendanceRequest,
  ): Promise<AttendanceResponse> => {
    const response = await apiService.put<ApiEnvelope<AttendanceResponse>>(
      `api/v1/attendance/${attendanceId}/adjust`,
      data,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },
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

  dailySummary: async (
    params: AttendanceDailySummaryParams,
  ): Promise<AttendanceDailySummaryResponse> => {
    const response = await apiService.get<ApiEnvelope<AttendanceDailySummaryResponse>>(
      "api/v1/attendance/summary",
      { locationId: params.locationId, date: params.date },
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },
};
