import apiService from "@/lib/api/core";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import { assertMembershipSuccess } from "@/lib/support/membership/assert-success";
import type { ApiEnvelope } from "@/types/api";
import type {
  TransferDepartmentRequest,
  TransferDepartmentResponse,
} from "@/types/location-membership";

export const fetchDepartmentMembership = {
  transferDepartment: async (
    data: TransferDepartmentRequest
  ): Promise<TransferDepartmentResponse> => {
    const response = await apiService.post<ApiEnvelope<TransferDepartmentResponse>>(
      "api/v1/department-memberships/transfer",
      data
    );
    return assertMembershipSuccess(normalizeApiResponse(response.data));
  },
};
