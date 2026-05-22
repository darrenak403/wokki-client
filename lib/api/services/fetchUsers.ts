import { assertFoundationSuccess } from "@/lib/support/foundation/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  CreateUserRequest,
  PagedResponse,
  UserListParams,
  UserResponse,
} from "@/types/foundation";

export const fetchUsers = {
  list: async (params: UserListParams = {}): Promise<PagedResponse<UserResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<UserResponse>>>(
      "api/v1/users",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      },
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  getById: async (id: string): Promise<UserResponse> => {
    const response = await apiService.get<ApiEnvelope<UserResponse>>(`api/v1/users/${id}`);
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  create: async (data: CreateUserRequest): Promise<string> => {
    const response = await apiService.post<ApiEnvelope<string>>("api/v1/users", data);
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },
};
