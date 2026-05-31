import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope, ApiError, AppMessage } from "@/types/api";
import type { PagedResponse } from "@/types/foundation";
import type {
  PlatformListParams,
  PlatformOrganizationResponse,
  PlatformUserResponse,
  UpdateOrganizationSubscriptionRequest,
} from "@/types/platform";

function assertSuccess<T>(response: {
  success: boolean;
  data: T | null;
  message: AppMessage;
}): T {
  if (!response.success || response.data == null) {
    const err: ApiError = {
      message: response.message?.text ?? "Yêu cầu thất bại",
      messageCode: response.message?.code,
      httpStatus: response.message?.statusCode,
      status: false,
    };
    throw err;
  }
  return response.data;
}

export const fetchPlatform = {
  listUsers: async (params: PlatformListParams = {}): Promise<PagedResponse<PlatformUserResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<PlatformUserResponse>>>(
      "api/v1/platform/users",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        ...(params.search ? { search: params.search } : {}),
        ...(params.organizationId ? { organizationId: params.organizationId } : {}),
        ...(params.role ? { role: params.role } : {}),
      }
    );
    return assertSuccess(normalizeApiResponse(response.data));
  },

  listOrganizations: async (
    params: PlatformListParams = {}
  ): Promise<PagedResponse<PlatformOrganizationResponse>> => {
    const response = await apiService.get<
      ApiEnvelope<PagedResponse<PlatformOrganizationResponse>>
    >("api/v1/platform/organizations", {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      ...(params.search ? { search: params.search } : {}),
    });
    return assertSuccess(normalizeApiResponse(response.data));
  },

  updateSubscription: async (
    organizationId: string,
    body: UpdateOrganizationSubscriptionRequest
  ): Promise<PlatformOrganizationResponse> => {
    const response = await apiService.put<ApiEnvelope<PlatformOrganizationResponse>>(
      `api/v1/platform/organizations/${organizationId}/subscription`,
      body
    );
    return assertSuccess(normalizeApiResponse(response.data));
  },
};
