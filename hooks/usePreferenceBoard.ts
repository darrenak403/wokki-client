"use client";

import { useQuery } from "@tanstack/react-query";
import { scheduleKeys } from "@/lib/api/query-keys";
import { fetchSchedules } from "@/lib/api/services/fetchSchedules";
import { mapScheduleError } from "@/lib/support/schedule/map-errors";

export function usePreferenceBoardQuery(scheduleId: string | null, enabled = true) {
  return useQuery({
    queryKey: scheduleKeys.preferenceBoard(scheduleId ?? ""),
    queryFn: () => fetchSchedules.getPreferenceBoard(scheduleId!),
    enabled: Boolean(scheduleId) && enabled,
    staleTime: 0,
    refetchOnMount: "always",
    meta: { mapError: mapScheduleError },
  });
}
