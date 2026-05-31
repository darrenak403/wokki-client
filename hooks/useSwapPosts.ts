"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeKeys, swapPostKeys } from "@/lib/api/query-keys";
import { fetchSelf } from "@/lib/api/services/fetchSelf";
import { fetchSwapPosts } from "@/lib/api/services/fetchSwapPosts";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import type {
  AcceptSwapPostRequest,
  CreateSwapPostRequest,
  SwapPostListParams,
} from "@/types/employee";

const STALE_MS = 30 * 1000;

function invalidateSwapQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: swapPostKeys.all });
  void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
}

export function useMyDraftWeekAssignmentsQuery(weekStartDate: string | null) {
  return useQuery({
    queryKey: employeeKeys.draftWeekAssignments(weekStartDate ?? ""),
    queryFn: () => fetchSelf.getDraftWeekAssignments(weekStartDate!),
    enabled: Boolean(weekStartDate),
    staleTime: STALE_MS,
  });
}

export function useSwapPostFeedQuery(scheduleId: string | null, enabled = true) {
  return useQuery({
    queryKey: swapPostKeys.feed(scheduleId ?? ""),
    queryFn: () =>
      fetchSwapPosts.feed({
        scheduleId: scheduleId!,
        page: 1,
        pageSize: 50,
      }),
    enabled: enabled && Boolean(scheduleId),
    staleTime: STALE_MS,
  });
}

export function useMySwapPostsQuery(params: SwapPostListParams, enabled = true) {
  return useQuery({
    queryKey: swapPostKeys.mine(params),
    queryFn: () => fetchSwapPosts.mine(params),
    enabled,
    staleTime: STALE_MS,
  });
}

export function useSwapPostAuditQuery(params: SwapPostListParams, enabled = true) {
  return useQuery({
    queryKey: swapPostKeys.audit(params),
    queryFn: () => fetchSwapPosts.audit(params),
    enabled,
    staleTime: STALE_MS,
  });
}

export function useCreateSwapPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSwapPostRequest) => fetchSwapPosts.create(data),
    onSuccess: () => {
      invalidateSwapQueries(queryClient);
      toast.success("Đã đăng bài đổi ca.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}

export function useAcceptSwapPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data?: AcceptSwapPostRequest }) =>
      fetchSwapPosts.accept(postId, data ?? {}),
    onSuccess: () => {
      invalidateSwapQueries(queryClient);
      toast.success("Đã đổi ca thành công.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}

export function usePreviewAcceptSwapPostMutation() {
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data?: AcceptSwapPostRequest }) =>
      fetchSwapPosts.previewAccept(postId, data ?? {}),
  });
}

export function useCancelSwapPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => fetchSwapPosts.cancel(postId),
    onSuccess: () => {
      invalidateSwapQueries(queryClient);
      toast.success("Đã hủy bài đăng.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}
