"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orgJoinKeys } from "@/lib/api/query-keys";
import { fetchOrgJoin } from "@/lib/api/services/fetchOrgJoin";
import { mapFoundationError } from "@/lib/support/foundation/map-errors";
import type {
  ApproveOrgJoinRequest,
  RejectOrgJoinRequest,
  SubmitOrgJoinRequest,
} from "@/types/org-join";

export function useOrgDirectoryQuery(params: {
  page: number;
  pageSize: number;
  search?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: orgJoinKeys.directory(params),
    queryFn: () =>
      fetchOrgJoin.listDirectory({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      }),
    enabled: params.enabled !== false,
  });
}

export function useMyOrgJoinRequestQuery(enabled = true) {
  return useQuery({
    queryKey: orgJoinKeys.me(),
    queryFn: () => fetchOrgJoin.getMe(),
    enabled,
    retry: false,
  });
}

export function usePendingOrgJoinRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: orgJoinKeys.pending(),
    queryFn: () => fetchOrgJoin.listPending(),
    enabled,
  });
}

export function useSubmitOrgJoinMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitOrgJoinRequest) => fetchOrgJoin.submit(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgJoinKeys.me() });
      toast.success("Đã gửi yêu cầu tham gia.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useCancelOrgJoinMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchOrgJoin.cancelMe(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgJoinKeys.me() });
      toast.success("Đã hủy yêu cầu.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useApproveOrgJoinMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveOrgJoinRequest }) =>
      fetchOrgJoin.approve(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgJoinKeys.pending() });
      toast.success("Đã duyệt yêu cầu tham gia.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useRejectOrgJoinMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectOrgJoinRequest }) =>
      fetchOrgJoin.reject(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgJoinKeys.pending() });
      toast.success("Đã từ chối yêu cầu.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}
