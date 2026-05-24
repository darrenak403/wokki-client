"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { preferenceKeys, scheduleKeys } from "@/lib/api/query-keys";
import { fetchSchedulePreferences } from "@/lib/api/services/fetchSchedulePreferences";
import { mapSchedulePreferenceError } from "@/lib/support/schedule-preference/map-errors";
import type { SaveSchedulePreferencesRequest } from "@/types/schedule-preferences";

const STALE_MS = 0;

export function useEmployeePreferenceScheduleQuery(weekStartDate: string | null) {
  return useQuery({
    queryKey: preferenceKeys.draft(weekStartDate ?? ""),
    queryFn: () => fetchSchedulePreferences.getScheduleForWeek(weekStartDate!),
    enabled: Boolean(weekStartDate),
    staleTime: STALE_MS,
  });
}

export function useMySchedulePreferencesQuery(scheduleId: string | null) {
  return useQuery({
    queryKey: preferenceKeys.mine(scheduleId ?? ""),
    queryFn: () => fetchSchedulePreferences.getMine(scheduleId!),
    enabled: Boolean(scheduleId),
    staleTime: STALE_MS,
  });
}

export function useSaveSchedulePreferencesMutation(scheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveSchedulePreferencesRequest) =>
      fetchSchedulePreferences.saveMine(scheduleId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: preferenceKeys.mine(scheduleId) });
      toast.success("Đã lưu nháp đăng ký ca.");
    },
    onError: async (error) => {
      await queryClient.invalidateQueries({ queryKey: preferenceKeys.mine(scheduleId) });
      toast.error(mapSchedulePreferenceError(error));
    },
  });
}

export function useSubmitSchedulePreferencesMutation(scheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchSchedulePreferences.submitMine(scheduleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: preferenceKeys.mine(scheduleId) });
      await queryClient.invalidateQueries({
        queryKey: scheduleKeys.preferenceBoard(scheduleId),
      });
      toast.success("Đã gửi đăng ký ca.");
    },
    onError: async (error) => {
      await queryClient.invalidateQueries({ queryKey: preferenceKeys.mine(scheduleId) });
      toast.error(mapSchedulePreferenceError(error));
    },
  });
}
