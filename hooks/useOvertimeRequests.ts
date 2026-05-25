"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeKeys, overtimeKeys } from "@/lib/api/query-keys";
import { fetchOvertimeRequests } from "@/lib/api/services/fetchOvertimeRequests";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import type { OvertimeActionRequest, OvertimeAdminListParams, OvertimeListParams } from "@/types/overtime";

export function useSubmitOTRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fetchOvertimeRequests.submit,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      toast.success("Đã gửi yêu cầu tăng ca.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}

export function useClockOutOTMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchOvertimeRequests.clockOutOT(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Đã kết thúc tăng ca.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}

export function useMyOTRequestsQuery(params?: { shiftAssignmentId?: string }) {
  return useQuery({
    queryKey: overtimeKeys.my(params),
    queryFn: () => fetchOvertimeRequests.listMy(params),
    staleTime: 60 * 1000,
  });
}

export function usePendingOTRequestsQuery(params?: OvertimeListParams) {
  return useQuery({
    queryKey: overtimeKeys.pending(params),
    queryFn: () => fetchOvertimeRequests.listPending(params),
    enabled: !!params,
    staleTime: 30 * 1000,
  });
}

export function useAdminOTListQuery(params?: OvertimeAdminListParams) {
  return useQuery({
    queryKey: overtimeKeys.adminList(params),
    queryFn: () => fetchOvertimeRequests.listAll(params!),
    enabled: !!params,
  });
}

export function useApproveOTMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: OvertimeActionRequest }) =>
      fetchOvertimeRequests.approve(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      toast.success("Đã duyệt yêu cầu tăng ca.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}

export function useRejectOTMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: OvertimeActionRequest }) =>
      fetchOvertimeRequests.reject(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      toast.success("Đã từ chối yêu cầu tăng ca.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}
