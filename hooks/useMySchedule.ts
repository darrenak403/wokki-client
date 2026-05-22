"use client";

import { useQuery } from "@tanstack/react-query";
import { employeeKeys } from "@/lib/api/query-keys";
import { fetchSelf } from "@/lib/api/services/fetchSelf";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";

const STALE_MS = 60 * 1000;

export function useMyScheduleQuery() {
  return useQuery({
    queryKey: employeeKeys.mySchedule(),
    queryFn: () => fetchSelf.getSchedule(),
    staleTime: STALE_MS,
    meta: { mapError: mapEmployeeError },
  });
}
