import { SCHEDULE_STATUS, type ScheduleStatus } from "@/types/schedule";

/** BE may return numeric enum (0|1|2) or string via JsonStringEnumConverter. */
export type RawScheduleStatus =
  | ScheduleStatus
  | "Draft"
  | "Published"
  | "Locked"
  | string
  | number;

const STRING_TO_STATUS: Record<string, ScheduleStatus> = {
  Draft: SCHEDULE_STATUS.Draft,
  Published: SCHEDULE_STATUS.Published,
  Locked: SCHEDULE_STATUS.Locked,
};

export function normalizeScheduleStatus(raw: RawScheduleStatus | undefined | null): ScheduleStatus {
  if (raw === undefined || raw === null) {
    return SCHEDULE_STATUS.Draft;
  }

  if (typeof raw === "number" && raw >= 0 && raw <= 2) {
    return raw as ScheduleStatus;
  }

  if (typeof raw === "string") {
    const mapped = STRING_TO_STATUS[raw];
    if (mapped !== undefined) {
      return mapped;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 2) {
      return parsed as ScheduleStatus;
    }
    if (process.env.NODE_ENV === "development") {
      console.warn("[schedule] Unknown status from API:", raw, "— defaulting to Draft");
    }
  }

  return SCHEDULE_STATUS.Draft;
}
