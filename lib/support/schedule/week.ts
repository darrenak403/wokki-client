import {
  addDays,
  addWeeks as addWeeksFns,
  format,
  isMonday as isMondayFns,
  parseISO,
  startOfWeek,
} from "date-fns";

/** Monday-start week as YYYY-MM-DD (BR-020). */
export function toMondayISO(date: Date): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd");
}

export function isMonday(isoDate: string): boolean {
  return isMondayFns(parseISO(isoDate));
}

export function addWeeksISO(isoMonday: string, weeks: number): string {
  return format(addWeeksFns(parseISO(isoMonday), weeks), "yyyy-MM-dd");
}

/** Seven ISO dates Mon–Sun for a Monday week start. */
export function weekDayDates(weekStartMonday: string): string[] {
  const start = parseISO(weekStartMonday);
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), "yyyy-MM-dd"));
}
