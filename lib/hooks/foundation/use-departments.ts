"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { foundationKeys } from "@/lib/api/query-keys";
import { fetchDepartments } from "@/lib/api/services/fetchDepartments";
import { mapFoundationError } from "@/lib/auth/map-foundation-error";
import type { CreateDepartmentRequest, UpdateDepartmentRequest } from "@/types/foundation";

const STALE_MS = 5 * 60 * 1000;

export function useDepartmentsQuery(locationId?: string | null) {
  return useQuery({
    queryKey: foundationKeys.departments(locationId),
    queryFn: () => fetchDepartments.list(locationId ?? undefined),
    enabled: Boolean(locationId),
    staleTime: STALE_MS,
  });
}

export function useCreateDepartmentMutation(locationId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) => fetchDepartments.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foundationKeys.departments(locationId) });
      void queryClient.invalidateQueries({ queryKey: foundationKeys.all });
      toast.success("Đã tạo phòng ban.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useUpdateDepartmentMutation(locationId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
      fetchDepartments.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foundationKeys.departments(locationId) });
      void queryClient.invalidateQueries({ queryKey: foundationKeys.all });
      toast.success("Đã cập nhật phòng ban.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}
