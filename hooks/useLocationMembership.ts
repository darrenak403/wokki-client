"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useRequestLocationMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locationId: string) => fetchLocationMembership.request(locationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: membershipKeys.my() });
    },
  });
}
