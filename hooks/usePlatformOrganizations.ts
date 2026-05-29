import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlatform } from "@/lib/api/services/fetchPlatform";
import { platformKeys } from "@/lib/api/query-keys";
import type { PlatformListParams, UpdateOrganizationSubscriptionRequest } from "@/types/platform";

export function usePlatformOrganizationsQuery(params: PlatformListParams = {}) {
  const queryParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    search: params.search ?? "",
  };

  return useQuery({
    queryKey: platformKeys.organizations(queryParams),
    queryFn: () => fetchPlatform.listOrganizations(queryParams),
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
