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
import type { EmployeeResponse, UpdateMyProfileRequest } from "@/types/foundation";

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

  getProfile: async (): Promise<EmployeeResponse> => {
    const response = await apiService.get<ApiEnvelope<EmployeeResponse>>("api/v1/self/profile");
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  updateProfile: async (data: UpdateMyProfileRequest): Promise<EmployeeResponse> => {
    const response = await apiService.put<ApiEnvelope<EmployeeResponse>>(
      "api/v1/self/profile",
      data,
    );
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },

  uploadPaymentQr: async (file: File): Promise<{ paymentQrImageUrl: string; paymentQrPublicId: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiService.post<
      ApiEnvelope<{ paymentQrImageUrl: string; paymentQrPublicId: string }>
    >("api/v1/self/profile/payment-qr", formData);
    return assertEmployeeSuccess(normalizeApiResponse(response.data));
  },
};
