"use client";

import { useQuery } from "@tanstack/react-query";
import { scheduleKeys } from "@/lib/api/query-keys";
import { fetchSchedules } from "@/lib/api/services/fetchSchedules";
import { mapScheduleError } from "@/lib/support/schedule/map-errors";
import type { ScheduleRosterParams } from "@/types/roster";

const STALE_MS = 60 * 1000;

export function useRosterQuery(params: ScheduleRosterParams | null) {
  return useQuery({
    queryKey: scheduleKeys.roster(params ?? { weekStartDate: "" }),
    queryFn: () => fetchSchedules.roster(params!),
    enabled: Boolean(params?.weekStartDate),
    staleTime: STALE_MS,
    meta: { mapError: mapScheduleError },
  });
}
