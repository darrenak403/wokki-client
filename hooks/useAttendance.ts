"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { employeeKeys, opsKeys } from "@/lib/api/query-keys";
import { fetchAttendance } from "@/lib/api/services/fetchAttendance";
import { fetchSelf } from "@/lib/api/services/fetchSelf";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import type {
  AdjustAttendanceRequest,
  ClockInRequest,
  SelfAttendanceListParams,
  TeamAttendanceListParams,
} from "@/types/employee";

const STALE_MS = 60 * 1000;

function defaultMonthRange(): SelfAttendanceListParams {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    fromDate: format(from, "yyyy-MM-dd"),
    toDate: format(to, "yyyy-MM-dd"),
  };
}

export function useAttendanceHistoryQuery(params?: SelfAttendanceListParams) {
  const range = params ?? defaultMonthRange();
  return useQuery({
    queryKey: employeeKeys.attendance(range),
    queryFn: () => fetchSelf.listAttendance(range),
    staleTime: STALE_MS,
  });
}

export function useClockInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClockInRequest = {}) => fetchAttendance.clockIn(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Đã chấm công vào.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}

export function useClockOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchAttendance.clockOut(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Đã chấm công ra.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}

function openRecordRange(): SelfAttendanceListParams {
  const now = new Date();
  return {
    fromDate: format(subDays(now, 35), "yyyy-MM-dd"),
    toDate: format(now, "yyyy-MM-dd"),
  };
}

/** Open attendance record (clockOut null), including prior month. */
export function useOpenAttendanceRecord() {
  const { data: history = [] } = useAttendanceHistoryQuery(openRecordRange());
  return history.find((r) => r.clockOut === null) ?? null;
}

export function useTeamAttendanceQuery(
  params: TeamAttendanceListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: opsKeys.teamAttendance(params),
    queryFn: () => fetchAttendance.list(params),
    enabled,
    staleTime: STALE_MS,
  });
}

export function useAdjustAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attendanceId,
      data,
    }: {
      attendanceId: string;
      data: AdjustAttendanceRequest;
    }) => fetchAttendance.adjust(attendanceId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: opsKeys.all });
      toast.success("Đã điều chỉnh chấm công.");
    },
    onError: (error) => toast.error(mapEmployeeError(error)),
  });
}
