import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectAppRole,
  selectHasOrgContext,
  selectIsAuthenticated,
  selectIsPlatformOperator,
} from "@/lib/redux/slices/authSlice";
import { fetchStats } from "@/lib/api/services/fetchStats";
import { statsKeys } from "@/lib/api/query-keys";
import { ROLE_ADMIN, ROLE_MANAGER } from "@/lib/types/roles";
import type { OrgSubscriptionResponse } from "@/types/stats";
import type { ApiError } from "@/types/api";

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "httpStatus" in error &&
    (error as ApiError).httpStatus === 404
  );
}

function hasSubscriptionFields(
  stats: Partial<OrgSubscriptionResponse> & { organizationId?: string }
): stats is OrgSubscriptionResponse {
  return typeof stats.subscriptionStatus === "string";
}

async function fetchOrgSubscriptionForRole(
  isAdminOrManager: boolean
): Promise<OrgSubscriptionResponse> {
  if (isAdminOrManager) {
    try {
      const stats = await fetchStats.org();
      if (hasSubscriptionFields(stats)) {
        return {
          organizationId: stats.organizationId,
          subscriptionStatus: stats.subscriptionStatus,
          subscriptionDurationDays: stats.subscriptionDurationDays ?? 0,
          subscriptionExpiresAt: stats.subscriptionExpiresAt ?? null,
          daysRemaining: stats.daysRemaining ?? null,
        };
      }
    } catch {
      // fall through to dedicated subscription route
    }
  }

  try {
    return await fetchStats.subscription();
  } catch (error) {
    if (isAdminOrManager && isNotFoundError(error)) {
      const stats = await fetchStats.org();
      if (hasSubscriptionFields(stats)) {
        return {
          organizationId: stats.organizationId,
          subscriptionStatus: stats.subscriptionStatus,
          subscriptionDurationDays: stats.subscriptionDurationDays ?? 0,
          subscriptionExpiresAt: stats.subscriptionExpiresAt ?? null,
          daysRemaining: stats.daysRemaining ?? null,
        };
      }
    }
    throw error;
  }
}

export function useOrgSubscriptionQuery(options?: {
  enabled?: boolean;
  retry?: boolean | number;
}) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isPlatformOperator = useAppSelector(selectIsPlatformOperator);
  const hasOrg = useAppSelector(selectHasOrgContext);
  const role = useAppSelector(selectAppRole);
  const isAdminOrManager = role === ROLE_ADMIN || role === ROLE_MANAGER;
  const defaultEnabled = isAuthenticated && !isPlatformOperator && hasOrg;

  return useQuery({
    queryKey: [...statsKeys.subscription(), role ?? "none"],
    queryFn: () => fetchOrgSubscriptionForRole(isAdminOrManager),
    staleTime: 60_000,
    refetchInterval: 60_000,
    enabled: options?.enabled ?? defaultEnabled,
    retry: options?.retry ?? 1,
  });
}
