import type {
  ScheduleDetailResponse,
  ScheduleResponse,
} from "@/types/schedule";
import { normalizeScheduleStatus } from "@/lib/support/schedule/normalize-status";

export function normalizeScheduleResponse(schedule: ScheduleResponse): ScheduleResponse {
  return {
    ...schedule,
    status: normalizeScheduleStatus(schedule.status),
  };
}

export function normalizeScheduleDetail(detail: ScheduleDetailResponse): ScheduleDetailResponse {
  return {
    ...detail,
    schedule: normalizeScheduleResponse(detail.schedule),
  };
}
