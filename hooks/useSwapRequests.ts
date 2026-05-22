"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeKeys } from "@/lib/api/query-keys";
import { fetchSelf } from "@/lib/api/services/fetchSelf";
import { fetchSwapRequests } from "@/lib/api/services/fetchSwapRequests";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import type {
  CreateSwapRequest,
  SwapActionRequest,
  SwapTargetsParams,
} from "@/types/employee";

const STALE_MS = 60 * 1000;

function invalidateEmployeeApp(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: employeeKeys.mySchedule() });
  void queryClient.invalidateQueries({ queryKey: employeeKeys.swaps() });
  void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
}

export function useMySwapRequestsQuery() {
  return useQuery({
    queryKey: employeeKeys.swaps(),
    queryFn: () => fetchSelf.listSwapRequests(),
    staleTime: STALE_MS,
  });
}

export function useSwapTargetsQuery(params: SwapTargetsParams = {}, enabled = true) {
  return useQuery({
    queryKey: employeeKeys.swapTargets(params),
    queryFn: () => fetchSelf.getSwapTargets(params),
    enabled,
    staleTime: STALE_MS,
    retry: false,
  });
}

export function useCreateSwapMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSwapRequest) => fetchSwapRequests.create(data),
    onSuccess: () => {
      invalidateEmployeeApp(queryClient);
      toast.success("Đã gửi yêu cầu đổi ca.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}

export function useAcceptSwapMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ swapId, data }: { swapId: string; data?: SwapActionRequest }) =>
      fetchSwapRequests.accept(swapId, data ?? {}),
    onSuccess: () => {
      invalidateEmployeeApp(queryClient);
      toast.success("Đã chấp nhận đổi ca.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}

export function useDeclineSwapMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ swapId, data }: { swapId: string; data?: SwapActionRequest }) =>
      fetchSwapRequests.decline(swapId, data ?? {}),
    onSuccess: () => {
      invalidateEmployeeApp(queryClient);
      toast.success("Đã từ chối yêu cầu đổi ca.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}

export function useCancelSwapMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ swapId, data }: { swapId: string; data?: SwapActionRequest }) =>
      fetchSwapRequests.cancel(swapId, data ?? {}),
    onSuccess: () => {
      invalidateEmployeeApp(queryClient);
      toast.success("Đã hủy yêu cầu đổi ca.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}
