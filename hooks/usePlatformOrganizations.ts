import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlatform } from "@/lib/api/services/fetchPlatform";
import { platformKeys } from "@/lib/api/query-keys";
import type {
  PlatformOrganizationListParams,
  PlatformSubscriptionLedgerListParams,
  PlatformSupportSearchParams,
  PlatformUsageAnalyticsParams,
  UpdateOrganizationSubscriptionRequest,
} from "@/types/platform";

export function usePlatformOrganizationsQuery(params: PlatformOrganizationListParams = {}) {
  const queryParams: PlatformOrganizationListParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    search: params.search || undefined,
    status: params.status,
    sortBy: params.sortBy ?? "createdAt",
    sortDirection: params.sortDirection ?? "desc",
    expiringWithinDays: params.expiringWithinDays ?? 7,
  };
  const keyParams = { ...queryParams, search: queryParams.search ?? "", status: queryParams.status ?? "" };

  return useQuery({
    queryKey: platformKeys.organizations(keyParams),
    queryFn: () => fetchPlatform.listOrganizations(queryParams),
    staleTime: 30_000,
  });
}

export function usePlatformSubscriptionLedgerQuery(
  params: PlatformSubscriptionLedgerListParams = {},
  enabled = true
) {
  const queryParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    organizationId: params.organizationId ?? "",
    action: params.action ?? "",
    from: params.from ?? "",
    to: params.to ?? "",
  };

  return useQuery({
    queryKey: platformKeys.ledger(queryParams),
    queryFn: () => fetchPlatform.listSubscriptionLedger(queryParams),
    staleTime: 30_000,
    enabled,
  });
}

export function usePlatformOrganizationSubscriptionLedgerQuery(
  organizationId: string | null,
  params: Omit<PlatformSubscriptionLedgerListParams, "organizationId"> = {},
  enabled = true
) {
  const queryParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    action: params.action ?? "",
    from: params.from ?? "",
    to: params.to ?? "",
  };

  return useQuery({
    queryKey: platformKeys.organizationLedger(organizationId ?? "", queryParams),
    queryFn: () => fetchPlatform.listOrganizationSubscriptionLedger(organizationId!, queryParams),
    staleTime: 30_000,
    enabled: Boolean(organizationId) && enabled,
  });
}

export function usePlatformSupportSearchQuery(
  params: PlatformSupportSearchParams = {},
  enabled = true
) {
  const queryParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    query: params.query?.trim() ?? "",
  };

  return useQuery({
    queryKey: platformKeys.supportSearch(queryParams),
    queryFn: () => fetchPlatform.searchSupport(queryParams),
    staleTime: 30_000,
    enabled,
  });
}

export function usePlatformSupportContextQuery(organizationId: string | null, enabled = true) {
  return useQuery({
    queryKey: platformKeys.supportContext(organizationId ?? ""),
    queryFn: () => fetchPlatform.getSupportOrganizationContext(organizationId!),
    staleTime: 30_000,
    enabled: Boolean(organizationId) && enabled,
  });
}

export function usePlatformHealthQuery() {
  return useQuery({
    queryKey: platformKeys.health(),
    queryFn: () => fetchPlatform.getHealth(),
    staleTime: 30_000,
  });
}

export function usePlatformUsageAnalyticsQuery(params: PlatformUsageAnalyticsParams = {}) {
  const queryParams = {
    windowDays: params.windowDays ?? 7,
    organizationId: params.organizationId ?? "",
  };

  return useQuery({
    queryKey: platformKeys.usage(queryParams),
    queryFn: () =>
      fetchPlatform.getUsageAnalytics({
        windowDays: queryParams.windowDays,
        organizationId: queryParams.organizationId || undefined,
      }),
    staleTime: 30_000,
  });
}

export function useUpdateOrgSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      body,
    }: {
      organizationId: string;
      body: UpdateOrganizationSubscriptionRequest;
    }) => fetchPlatform.updateSubscription(organizationId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
    },
  });
}
