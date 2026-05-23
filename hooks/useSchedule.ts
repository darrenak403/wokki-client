"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { scheduleKeys } from "@/lib/api/query-keys";
import { fetchSchedules } from "@/lib/api/services/fetchSchedules";
import { mapScheduleError } from "@/lib/support/schedule/map-errors";
import type {
  ApplySuggestionsRequest,
  CopyScheduleRequest,
  CreateAssignmentRequest,
  CreateScheduleRequest,
  SuggestScheduleRequest,
  UpdateScheduleRequest,
} from "@/types/schedule";

const STALE_MS = 60 * 1000;

export type ScheduleListParams = { departmentId: string; weekStartDate: string };

function invalidateSchedule(
  queryClient: ReturnType<typeof useQueryClient>,
  scheduleId: string,
  listParams?: ScheduleListParams,
) {
  void queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(scheduleId) });
  if (listParams) {
    void queryClient.invalidateQueries({ queryKey: scheduleKeys.list(listParams) });
  }
  void queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
}

export function useScheduleListQuery(params: ScheduleListParams | null) {
  return useQuery({
    queryKey: scheduleKeys.list(params ?? { departmentId: "", weekStartDate: "" }),
    queryFn: () => fetchSchedules.list(params!),
    enabled: Boolean(params?.departmentId && params?.weekStartDate),
    staleTime: STALE_MS,
  });
}

export function useScheduleDetailQuery(scheduleId: string | null) {
  return useQuery({
    queryKey: scheduleKeys.detail(scheduleId ?? ""),
    queryFn: () => fetchSchedules.getById(scheduleId!),
    enabled: Boolean(scheduleId),
    staleTime: STALE_MS,
  });
}

export function useCreateScheduleMutation(listParams: ScheduleListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScheduleRequest) => fetchSchedules.create(data),
    onSuccess: (created) => {
      if (listParams) {
        void queryClient.invalidateQueries({ queryKey: scheduleKeys.list(listParams) });
      }
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(created.id) });
      toast.success("Đã tạo lịch tuần.");
    },
    onError: (error) => toast.error(mapScheduleError(error)),
  });
}

export function useUpdateScheduleMutation(scheduleId: string, listParams: ScheduleListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateScheduleRequest) => fetchSchedules.update(scheduleId, data),
    onSuccess: () => {
      invalidateSchedule(queryClient, scheduleId, listParams ?? undefined);
      toast.success("Đã cập nhật lịch.");
    },
    onError: (error) => toast.error(mapScheduleError(error)),
  });
}

export function useDeleteScheduleMutation(scheduleId: string, listParams: ScheduleListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchSchedules.delete(scheduleId),
    onSuccess: () => {
      if (listParams) {
        void queryClient.invalidateQueries({ queryKey: scheduleKeys.list(listParams) });
      }
      queryClient.removeQueries({ queryKey: scheduleKeys.detail(scheduleId) });
      toast.success("Đã xóa lịch.");
    },
    onError: (error) => toast.error(mapScheduleError(error)),
  });
}

export function useCreateAssignmentMutation(scheduleId: string, listParams: ScheduleListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) =>
      fetchSchedules.createAssignment(scheduleId, data),
    onSuccess: () => {
      invalidateSchedule(queryClient, scheduleId, listParams ?? undefined);
      toast.success("Đã phân ca.");
    },
    onError: (error) => toast.error(mapScheduleError(error)),
  });
}

export function useDeleteAssignmentMutation(scheduleId: string, listParams: ScheduleListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) =>
      fetchSchedules.deleteAssignment(scheduleId, assignmentId),
    onSuccess: () => {
      invalidateSchedule(queryClient, scheduleId, listParams ?? undefined);
      toast.success("Đã xóa phân ca.");
    },
    onError: (error) => toast.error(mapScheduleError(error)),
  });
}

export function useSuggestScheduleMutation(scheduleId: string) {
  return useMutation({
    mutationFn: (body: SuggestScheduleRequest = {}) => fetchSchedules.suggest(scheduleId, body),
    onError: (error) => toast.error(mapScheduleError(error)),
  });
}

export function useApplySuggestionsMutation(scheduleId: string, listParams: ScheduleListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplySuggestionsRequest) =>
      fetchSchedules.applySuggestions(scheduleId, data),
    onSuccess: () => {
      invalidateSchedule(queryClient, scheduleId, listParams ?? undefined);
      toast.success("Đã áp dụng gợi ý.");
    },
    onError: (error) => toast.error(mapScheduleError(error)),
  });
}

export function usePublishScheduleMutation(scheduleId: string, listParams: ScheduleListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchSchedules.publish(scheduleId),
    onSuccess: () => {
      invalidateSchedule(queryClient, scheduleId, listParams ?? undefined);
      toast.success("Đã công bố lịch. Nhân viên sẽ thấy lịch.");
    },
    onError: (error) => toast.error(mapScheduleError(error)),
  });
}

export function useUnpublishScheduleMutation(scheduleId: string, listParams: ScheduleListParams | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchSchedules.unpublish(scheduleId),
    onSuccess: () => {
      invalidateSchedule(queryClient, scheduleId, listParams ?? undefined);
      toast.success("Đã chuyển lịch về Nháp.");
    },
    onError: (error) => toast.error(mapScheduleError(error)),
  });
}

export function useCopyScheduleMutation(
  scheduleId: string,
  listParams: ScheduleListParams | null,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CopyScheduleRequest) => fetchSchedules.copy(scheduleId, data),
    onSuccess: (copied) => {
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      if (listParams) {
        void queryClient.invalidateQueries({ queryKey: scheduleKeys.list(listParams) });
      }
      void queryClient.invalidateQueries({
        queryKey: scheduleKeys.list({
          departmentId: copied.departmentId,
          weekStartDate: copied.weekStartDate,
        }),
      });
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(copied.id) });
      toast.success("Đã sao chép lịch sang tuần mới.");
    },
    onError: (error) => toast.error(mapScheduleError(error)),
  });
}
