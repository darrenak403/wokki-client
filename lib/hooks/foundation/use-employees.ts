"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { foundationKeys } from "@/lib/api/query-keys";
import { fetchEmployees } from "@/lib/api/services/fetchEmployees";
import { mapFoundationError } from "@/lib/auth/map-foundation-error";
import type {
  CreateEmployeeRequest,
  EmployeeListParams,
  UpdateEmployeeRequest,
} from "@/types/foundation";

export function useEmployeesQuery(params: EmployeeListParams) {
  return useQuery({
    queryKey: foundationKeys.employees(params),
    queryFn: () => fetchEmployees.list(params),
    staleTime: 60 * 1000,
  });
}

export function useEmployeeQuery(id: string | null) {
  return useQuery({
    queryKey: foundationKeys.employee(id ?? ""),
    queryFn: () => fetchEmployees.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => fetchEmployees.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...foundationKeys.all, "employees"],
      });
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      fetchEmployees.update(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...foundationKeys.all, "employees"],
      });
      void queryClient.invalidateQueries({
        queryKey: foundationKeys.employee(variables.id),
      });
      toast.success("Đã cập nhật nhân viên.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useTerminateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchEmployees.terminate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...foundationKeys.all, "employees"],
      });
      toast.success("Đã chấm dứt hợp đồng nhân viên.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}
