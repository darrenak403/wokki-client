import { differenceInMinutes, parseISO } from "date-fns";
import { ATTENDANCE_STATUS, type AttendanceResponse } from "@/types/employee";
import type { ShiftAssignmentResponse } from "@/types/schedule";

export function toTime(value?: string | null): string {
  return value?.slice(0, 5) ?? "--:--";
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
}

export function formatDurationShort(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function getClockInStatus(row: AttendanceResponse) {
  if (row.status === ATTENDANCE_STATUS.Adjusted) {
    return {
      label: "Đã chỉnh",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    };
  }

  if (row.status === ATTENDANCE_STATUS.Open) {
    return {
      label: "Đang mở",
      className: "bg-primary/10 text-primary border-primary/20",
    };
  }

  if (row.status === ATTENDANCE_STATUS.Late) {
    return {
      label: "Đi trễ",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    };
  }

  return {
    label: "Đúng giờ",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  };
}

export function getTodayShiftStatus(openRecord: AttendanceResponse | null, currentShift?: ShiftAssignmentResponse) {
  if (!currentShift) return "Không có ca hôm nay";
  if (!openRecord) return "Sẵn sàng chấm công";

  const expected = parseISO(`${currentShift.date}T${toTime(currentShift.startTime)}:00`);
  const actual = parseISO(openRecord.clockIn);
  const lateMinutes = differenceInMinutes(actual, expected);
  if (lateMinutes > 0) return `Đã vào trễ ${lateMinutes} phút`;
  return "Đang trong ca";
}

export function isShiftEnded(shift: ShiftAssignmentResponse | undefined, now: Date): boolean {
  if (!shift) return false;
  return now > parseISO(`${shift.date}T${toTime(shift.endTime)}:00`);
}

/** Closed attendance for this assignment — no further clock-in. */
export function isShiftAttendanceClosed(record: AttendanceResponse | null | undefined): boolean {
  return record?.clockOut != null;
}
