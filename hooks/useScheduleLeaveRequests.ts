"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchLeaveRequests } from "@/lib/api/services/fetchLeaveRequests";
import { leaveRequestKeys, scheduleKeys } from "@/lib/api/query-keys";
import type { CreateScheduleLeaveRequest } from "@/types/schedule-leave";

export function useMyLeaveRequestsQuery(scheduleId?: string | null) {
  return useQuery({
    queryKey: leaveRequestKeys.mine(scheduleId ?? undefined),
    queryFn: () => fetchLeaveRequests.listMine(scheduleId ?? undefined),
    enabled: scheduleId !== null,
    staleTime: 30_000,
  });
}

export function useLeaveRequestsReviewQuery(scheduleId: string | null, status = "Pending") {
  return useQuery({
    queryKey: leaveRequestKeys.review(scheduleId ?? "", status),
    queryFn: () => fetchLeaveRequests.listForReview(scheduleId!, status),
    enabled: Boolean(scheduleId),
    staleTime: 30_000,
  });
}

export function useCreateLeaveRequestMutation(scheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScheduleLeaveRequest) => fetchLeaveRequests.createMine(data),
    onSuccess: () => {
      toast.success("Đã gửi đơn xin nghỉ");
      void queryClient.invalidateQueries({ queryKey: leaveRequestKeys.mine(scheduleId) });
      void queryClient.invalidateQueries({ queryKey: leaveRequestKeys.review(scheduleId) });
    },
    onError: () => toast.error("Không gửi được đơn xin nghỉ"),
  });
}

export function useCancelLeaveRequestMutation(scheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchLeaveRequests.cancelMine(id),
    onSuccess: () => {
      toast.success("Đã huỷ đơn xin nghỉ");
      void queryClient.invalidateQueries({ queryKey: leaveRequestKeys.mine(scheduleId) });
      void queryClient.invalidateQueries({ queryKey: leaveRequestKeys.review(scheduleId) });
    },
  });
}

export function useApproveLeaveRequestMutation(scheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchLeaveRequests.approve(id),
    onSuccess: () => {
      toast.success("Đã duyệt đơn xin nghỉ");
      void queryClient.invalidateQueries({ queryKey: leaveRequestKeys.review(scheduleId) });
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(scheduleId) });
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.preferenceBoard(scheduleId) });
    },
  });
}

export function useRejectLeaveRequestMutation(scheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchLeaveRequests.reject(id),
    onSuccess: () => {
      toast.success("Đã từ chối đơn xin nghỉ");
      void queryClient.invalidateQueries({ queryKey: leaveRequestKeys.review(scheduleId) });
    },
  });
}
