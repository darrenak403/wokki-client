"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { foundationKeys } from "@/lib/api/query-keys";
import { fetchShifts } from "@/lib/api/services/fetchShifts";
import { mapFoundationError } from "@/lib/auth/map-foundation-error";
import {
  appendShiftDefinitionId,
  removeShiftDefinitionId,
} from "@/lib/foundation/session-context";
import type {
  CreateShiftRequest,
  ShiftListParams,
  UpdateShiftRequest,
} from "@/types/foundation";

const STALE_MS = 2 * 60 * 1000;

export function useShiftsQuery(params: ShiftListParams | null) {
  return useQuery({
    queryKey: foundationKeys.shifts({
      locationId: params?.locationId ?? "",
      departmentId: params?.departmentId ?? null,
    }),
    queryFn: () => fetchShifts.list(params!),
    enabled: Boolean(params?.locationId),
    staleTime: STALE_MS,
  });
}

export function useCreateShiftMutation(params: ShiftListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShiftRequest) => fetchShifts.create(data),
    onSuccess: (created) => {
      appendShiftDefinitionId(created.id);
      if (params) {
        void queryClient.invalidateQueries({ queryKey: foundationKeys.shifts(params) });
      }
      void queryClient.invalidateQueries({ queryKey: foundationKeys.all });
      toast.success("Đã tạo ca định nghĩa.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useUpdateShiftMutation(params: ShiftListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShiftRequest }) =>
      fetchShifts.update(id, data),
    onSuccess: () => {
      if (params) {
        void queryClient.invalidateQueries({ queryKey: foundationKeys.shifts(params) });
      }
      toast.success("Đã cập nhật ca định nghĩa.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useDeactivateShiftMutation(params: ShiftListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchShifts.deactivate(id),
    onSuccess: (_data, id) => {
      removeShiftDefinitionId(id);
      if (params) {
        void queryClient.invalidateQueries({ queryKey: foundationKeys.shifts(params) });
      }
      toast.success("Đã ngưng ca định nghĩa.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}
