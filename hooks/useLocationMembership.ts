"use client";

import { useQuery } from "@tanstack/react-query";
import { membershipKeys } from "@/lib/api/query-keys";
import { fetchLocationMembership } from "@/lib/api/services/fetchLocationMembership";
import type { LocationMembershipStatus } from "@/types/location-membership";

const STALE_MS = 60 * 1000;

export function useMyLocationMembership({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: membershipKeys.my(),
    queryFn: fetchLocationMembership.getMy,
    staleTime: STALE_MS,
    retry: false,
    enabled,
  });
}

export function useLocationMembershipsByLocationQuery(
  locationId: string | null,
  status?: LocationMembershipStatus | null,
  enabled = true
) {
  return useQuery({
    queryKey: membershipKeys.byLocation(locationId ?? "", status),
    queryFn: () => fetchLocationMembership.listByLocation(locationId!, status ?? undefined),
    staleTime: STALE_MS,
    enabled: Boolean(locationId) && enabled,
  });
}
