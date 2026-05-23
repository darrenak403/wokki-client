"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { schedulingConfigKeys } from "@/lib/api/query-keys";
import { fetchSchedulingConfig } from "@/lib/api/services/fetchSchedulingConfig";
import { mapSchedulingConfigError } from "@/lib/support/scheduling-config/map-errors";
import type {
  CreateJobPositionRequest,
  UpdateJobPositionRequest,
  UpdateSchedulingPolicyRequest,
} from "@/types/scheduling-config";

const STALE_MS = 60 * 1000;

export function useSchedulingPolicyQuery(departmentId: string | null) {
  return useQuery({
    queryKey: schedulingConfigKeys.policy(departmentId ?? ""),
    queryFn: () => fetchSchedulingConfig.getPolicy(departmentId!),
    enabled: Boolean(departmentId),
    staleTime: STALE_MS,
  });
}

export function useUpdateSchedulingPolicyMutation(departmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSchedulingPolicyRequest) =>
      fetchSchedulingConfig.updatePolicy(departmentId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: schedulingConfigKeys.policy(departmentId),
      });
      toast.success("Đã cập nhật luật lịch.");
    },
    onError: (error) => toast.error(mapSchedulingConfigError(error)),
  });
}

export function useJobPositionsQuery(departmentId: string | null) {
  return useQuery({
    queryKey: schedulingConfigKeys.jobPositions(departmentId ?? ""),
    queryFn: () => fetchSchedulingConfig.listJobPositions(departmentId!),
    enabled: Boolean(departmentId),
    staleTime: STALE_MS,
  });
}

export function useCreateJobPositionMutation(departmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobPositionRequest) =>
      fetchSchedulingConfig.createJobPosition(departmentId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: schedulingConfigKeys.jobPositions(departmentId),
      });
      toast.success("Đã tạo vị trí.");
    },
    onError: (error) => toast.error(mapSchedulingConfigError(error)),
  });
}

export function useUpdateJobPositionMutation(departmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobPositionId,
      data,
    }: {
      jobPositionId: string;
      data: UpdateJobPositionRequest;
    }) => fetchSchedulingConfig.updateJobPosition(departmentId, jobPositionId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: schedulingConfigKeys.jobPositions(departmentId),
      });
      toast.success("Đã cập nhật vị trí.");
    },
    onError: (error) => toast.error(mapSchedulingConfigError(error)),
  });
}

export function useDeleteJobPositionMutation(departmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobPositionId: string) =>
      fetchSchedulingConfig.deleteJobPosition(departmentId, jobPositionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: schedulingConfigKeys.jobPositions(departmentId),
      });
      toast.success("Đã vô hiệu hóa vị trí.");
    },
    onError: (error) => toast.error(mapSchedulingConfigError(error)),
  });
}
