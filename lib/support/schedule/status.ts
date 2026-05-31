import { SCHEDULE_STATUS, type ScheduleStatus } from "@/types/schedule";

export function isScheduleDraft(status: ScheduleStatus): boolean {
  return status === SCHEDULE_STATUS.Draft;
}

export function isScheduleEditable(status: ScheduleStatus): boolean {
  return status === SCHEDULE_STATUS.Draft;
}

export function isSchedulePublished(status: ScheduleStatus): boolean {
  return status === SCHEDULE_STATUS.Published;
}

export function scheduleStatusLabel(status: ScheduleStatus): string {
  switch (status) {
    case SCHEDULE_STATUS.Draft:
      return "Nháp";
    case SCHEDULE_STATUS.Published:
      return "Đã công bố";
    case SCHEDULE_STATUS.Locked:
      return "Đã khóa";
    default:
      return "Không xác định";
  }
}
