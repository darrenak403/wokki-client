import { assertFoundationSuccess } from "@/lib/support/foundation/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  PagedResponse,
  UserListParams,
  UserResponse,
} from "@/types/foundation";

export const fetchUsers = {
  list: async (params: UserListParams = {}): Promise<PagedResponse<UserResponse>> => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    };
    if (params.withoutEmployee === true) queryParams.withoutEmployee = true;
    const response = await apiService.get<ApiEnvelope<PagedResponse<UserResponse>>>(
      "api/v1/users",
      queryParams,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  getById: async (id: string): Promise<UserResponse> => {
    const response = await apiService.get<ApiEnvelope<UserResponse>>(`api/v1/users/${id}`);
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },
};
