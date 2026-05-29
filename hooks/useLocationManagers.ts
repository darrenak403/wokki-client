"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { foundationKeys, managerKeys } from "@/lib/api/query-keys";
import { fetchLocationManagers } from "@/lib/api/services/fetchLocationManagers";
import { mapMembershipError } from "@/lib/support/membership/map-errors";
import type { AssignLocationManagerRequest } from "@/types/location-membership";

const STALE_MS = 5 * 60 * 1000;

export function useLocationManagersQuery(locationId: string | null, enabled = true) {
  return useQuery({
    queryKey: managerKeys.byLocation(locationId ?? ""),
    queryFn: () => fetchLocationManagers.list(locationId!),
    staleTime: STALE_MS,
    enabled: Boolean(locationId) && enabled,
  });
}

export function useMyManagedLocationsQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: managerKeys.myLocations(),
    queryFn: fetchLocationManagers.myLocations,
    staleTime: STALE_MS,
    enabled,
  });
}

export function useAssignLocationManagerMutation(locationId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      locationId: targetLocationId,
      data,
    }: {
      locationId: string;
      data: AssignLocationManagerRequest;
    }) => fetchLocationManagers.assign(targetLocationId, data),
    onSuccess: (manager) => {
      void queryClient.invalidateQueries({ queryKey: managerKeys.byLocation(manager.locationId) });
      void queryClient.invalidateQueries({ queryKey: managerKeys.myLocations() });
      void queryClient.invalidateQueries({ queryKey: foundationKeys.locations() });
      if (locationId && locationId !== manager.locationId) {
        void queryClient.invalidateQueries({ queryKey: managerKeys.byLocation(locationId) });
      }
      toast.success("Đã gán Manager cho chi nhánh.");
    },
    onError: (error) => toast.error(mapMembershipError(error)),
  });
}

export function useRemoveLocationManagerMutation(locationId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      locationId: targetLocationId,
      userId,
    }: {
      locationId: string;
      userId: string;
    }) => fetchLocationManagers.remove(targetLocationId, userId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: managerKeys.byLocation(variables.locationId),
      });
      void queryClient.invalidateQueries({ queryKey: managerKeys.myLocations() });
      void queryClient.invalidateQueries({ queryKey: foundationKeys.locations() });
      if (locationId && locationId !== variables.locationId) {
        void queryClient.invalidateQueries({ queryKey: managerKeys.byLocation(locationId) });
      }
      toast.success("Đã gỡ Manager khỏi chi nhánh.");
    },
    onError: (error) => toast.error(mapMembershipError(error)),
  });
}
