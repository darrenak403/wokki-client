import { assertEmployeeSuccess } from "@/lib/support/employee/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  SelfAttendanceListParams,
  AttendanceResponse,
  ShiftAssignmentResponse,
  SwapRequestResponse,
  SwapTargetsParams,
} from "@/types/employee";

export const fetchSelf = {
  getSchedule: async (): Promise<ShiftAssignmentResponse[]> => {
    const response = await apiService.get<ApiEnvelope<ShiftAssignmentResponse[]>>(
      "api/v1/self/schedule",
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  /** Peer assignments for swap target picker — BE contract TBD (§1A handoff). */
  getSwapTargets: async (params: SwapTargetsParams = {}): Promise<ShiftAssignmentResponse[]> => {
    const response = await apiService.get<ApiEnvelope<ShiftAssignmentResponse[]>>(
      "api/v1/self/swap-targets",
      {
        ...(params.fromDate ? { fromDate: params.fromDate } : {}),
        ...(params.toDate ? { toDate: params.toDate } : {}),
      },
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  listSwapRequests: async (): Promise<SwapRequestResponse[]> => {
    const response = await apiService.get<ApiEnvelope<SwapRequestResponse[]>>(
      "api/v1/self/swap-requests",
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  listAttendance: async (
    params: SelfAttendanceListParams = {},
  ): Promise<AttendanceResponse[]> => {
    const response = await apiService.get<ApiEnvelope<AttendanceResponse[]>>(
      "api/v1/self/attendance",
      {
        ...(params.fromDate ? { fromDate: params.fromDate } : {}),
        ...(params.toDate ? { toDate: params.toDate } : {}),
      },
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },
};
