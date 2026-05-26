"use client";

import { useQuery } from "@tanstack/react-query";
import { membershipKeys } from "@/lib/api/query-keys";
import { fetchLocationMembership } from "@/lib/api/services/fetchLocationMembership";

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
