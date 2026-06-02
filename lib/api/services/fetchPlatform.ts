import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope, ApiError, AppMessage } from "@/types/api";
import type { PagedResponse } from "@/types/foundation";
import type {
  PlatformHealthResponse,
  PlatformListParams,
  PlatformOrganizationListParams,
  PlatformOrganizationSupportContextResponse,
  PlatformOrganizationResponse,
  PlatformSubscriptionLedgerEntryResponse,
  PlatformSubscriptionLedgerListParams,
  PlatformSupportSearchParams,
  PlatformSupportSearchResponse,
  PlatformUsageAnalyticsParams,
  PlatformUsageAnalyticsResponse,
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
    params: PlatformOrganizationListParams = {}
  ): Promise<PagedResponse<PlatformOrganizationResponse>> => {
    const response = await apiService.get<
      ApiEnvelope<PagedResponse<PlatformOrganizationResponse>>
    >("api/v1/platform/organizations", {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      ...(params.search ? { search: params.search } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params.sortDirection ? { sortDirection: params.sortDirection } : {}),
      ...(params.expiringWithinDays ? { expiringWithinDays: params.expiringWithinDays } : {}),
    });
    return assertSuccess(normalizeApiResponse(response.data));
  },

  listSubscriptionLedger: async (
    params: PlatformSubscriptionLedgerListParams = {}
  ): Promise<PagedResponse<PlatformSubscriptionLedgerEntryResponse>> => {
    const response = await apiService.get<
      ApiEnvelope<PagedResponse<PlatformSubscriptionLedgerEntryResponse>>
    >("api/v1/platform/subscription-ledger", {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      ...(params.organizationId ? { organizationId: params.organizationId } : {}),
      ...(params.action ? { action: params.action } : {}),
      ...(params.from ? { from: params.from } : {}),
      ...(params.to ? { to: params.to } : {}),
    });
    return assertSuccess(normalizeApiResponse(response.data));
  },

  listOrganizationSubscriptionLedger: async (
    organizationId: string,
    params: Omit<PlatformSubscriptionLedgerListParams, "organizationId"> = {}
  ): Promise<PagedResponse<PlatformSubscriptionLedgerEntryResponse>> => {
    const response = await apiService.get<
      ApiEnvelope<PagedResponse<PlatformSubscriptionLedgerEntryResponse>>
    >(`api/v1/platform/organizations/${organizationId}/subscription-ledger`, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      ...(params.action ? { action: params.action } : {}),
      ...(params.from ? { from: params.from } : {}),
      ...(params.to ? { to: params.to } : {}),
    });
    return assertSuccess(normalizeApiResponse(response.data));
  },

  searchSupport: async (
    params: PlatformSupportSearchParams = {}
  ): Promise<PagedResponse<PlatformSupportSearchResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<PlatformSupportSearchResponse>>>(
      "api/v1/platform/support/search",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        ...(params.query ? { query: params.query } : {}),
      }
    );
    return assertSuccess(normalizeApiResponse(response.data));
  },

  getSupportOrganizationContext: async (
    organizationId: string
  ): Promise<PlatformOrganizationSupportContextResponse> => {
    const response = await apiService.get<
      ApiEnvelope<PlatformOrganizationSupportContextResponse>
    >(`api/v1/platform/support/organizations/${organizationId}/context`);
    return assertSuccess(normalizeApiResponse(response.data));
  },

  getHealth: async (): Promise<PlatformHealthResponse> => {
    const response = await apiService.get<ApiEnvelope<PlatformHealthResponse>>(
      "api/v1/platform/health"
    );
    return assertSuccess(normalizeApiResponse(response.data));
  },

  getUsageAnalytics: async (
    params: PlatformUsageAnalyticsParams = {}
  ): Promise<PlatformUsageAnalyticsResponse> => {
    const response = await apiService.get<ApiEnvelope<PlatformUsageAnalyticsResponse>>(
      "api/v1/platform/usage-analytics",
      {
        ...(params.windowDays ? { windowDays: params.windowDays } : {}),
        ...(params.organizationId ? { organizationId: params.organizationId } : {}),
      }
    );
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
