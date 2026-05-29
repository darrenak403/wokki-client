"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { foundationKeys } from "@/lib/api/query-keys";
import { fetchLocations } from "@/lib/api/services/fetchLocations";
import { mapFoundationError } from "@/lib/support/foundation/map-errors";
import type {
  CreateLocationRequest,
  UpdateLocationRequest,
  UpsertLocationSchedulingPolicyRequest,
} from "@/types/foundation";

const STALE_MS = 5 * 60 * 1000;

export function useLocationsQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: foundationKeys.locations(),
    queryFn: () => fetchLocations.list(),
    staleTime: STALE_MS,
    enabled,
  });
}

export function useActiveLocationsQuery() {
  return useQuery({
    queryKey: [...foundationKeys.locations(), "available"] as const,
    queryFn: () => fetchLocations.listActive(),
    staleTime: STALE_MS,
  });
}

export function useCreateLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLocationRequest) => fetchLocations.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foundationKeys.locations() });
      toast.success("Đã tạo chi nhánh.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useUpdateLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) =>
      fetchLocations.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foundationKeys.locations() });
      toast.success("Đã cập nhật chi nhánh.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useLocationSchedulingPolicyQuery(locationId: string | null, enabled = true) {
  return useQuery({
    queryKey: foundationKeys.locationPolicy(locationId ?? ""),
    queryFn: () => fetchLocations.getSchedulingPolicy(locationId!),
    enabled: Boolean(locationId) && enabled,
  });
}

export function useUpdateLocationSchedulingPolicyMutation(locationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertLocationSchedulingPolicyRequest) =>
      fetchLocations.updateSchedulingPolicy(locationId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foundationKeys.locationPolicy(locationId) });
      toast.success("Đã lưu luật chi nhánh.");
    },
    onError: () => toast.error("Không lưu được luật chi nhánh."),
  });
}
