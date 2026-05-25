import { differenceInMinutes, isBefore, isSameDay, parseISO, startOfDay } from "date-fns";
import type { ShiftAssignmentResponse } from "@/types/employee";

export interface DayGroup {
  dateKey: string;
  date: Date;
  isPast: boolean;
  isToday: boolean;
  assignments: ShiftAssignmentResponse[];
}

export function toTime(value: string): string {
  return value.slice(0, 5);
}

export function assignmentStart(assignment: ShiftAssignmentResponse): Date {
  return parseISO(`${assignment.date}T${toTime(assignment.startTime)}:00`);
}

export function assignmentEnd(assignment: ShiftAssignmentResponse): Date {
  return parseISO(`${assignment.date}T${toTime(assignment.endTime)}:00`);
}

export function getRelativeStart(assignment: ShiftAssignmentResponse, now: Date): string {
  const start = assignmentStart(assignment);
  const end = assignmentEnd(assignment);

  if (now >= start && now <= end) return "Đang diễn ra";

  const minutes = differenceInMinutes(start, now);
  if (minutes < 0) return "Đã qua";
  if (minutes < 60) return `Sắp bắt đầu trong ${minutes} phút`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Sắp bắt đầu trong ${hours} giờ`;

  const days = Math.round(hours / 24);
  return `Sắp bắt đầu trong ${days} ngày`;
}

export function getUpcoming(assignments: ShiftAssignmentResponse[], now: Date) {
  return [...assignments]
    .filter((assignment) => assignmentEnd(assignment) >= now)
    .sort((a, b) => assignmentStart(a).getTime() - assignmentStart(b).getTime())[0];
}

export function isOngoing(assignment: ShiftAssignmentResponse, now: Date): boolean {
  return now >= assignmentStart(assignment) && now <= assignmentEnd(assignment);
}

export function buildDayGroups(assignments: ShiftAssignmentResponse[], now: Date): DayGroup[] {
  const map = new Map<string, ShiftAssignmentResponse[]>();
  for (const a of assignments) {
    const list = map.get(a.date) ?? [];
    list.push(a);
    map.set(a.date, list);
  }

  const todayStart = startOfDay(now);

  const groups: DayGroup[] = Array.from(map.entries()).map(([dateKey, items]) => {
    const date = parseISO(dateKey);
    const isToday = isSameDay(date, now);
    const isPast = !isToday && isBefore(date, todayStart);
    return {
      dateKey,
      date,
      isPast,
      isToday,
      assignments: items.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    };
  });

  const upcoming = groups.filter((g) => !g.isPast).sort((a, b) => a.date.getTime() - b.date.getTime());
  const past = groups.filter((g) => g.isPast).sort((a, b) => a.date.getTime() - b.date.getTime());

  return [...upcoming, ...past];
}
