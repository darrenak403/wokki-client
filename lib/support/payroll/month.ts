import { addMonths, endOfMonth, format, parseISO, startOfMonth } from "date-fns";

/** Current calendar month as YYYY-MM */
export function currentMonthISO(date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function monthBounds(isoMonth: string): { startDate: string; endDate: string; label: string } {
  const base = parseISO(`${isoMonth}-01`);
  return {
    startDate: format(startOfMonth(base), "yyyy-MM-dd"),
    endDate: format(endOfMonth(base), "yyyy-MM-dd"),
    label: format(base, "MM/yyyy"),
  };
}

export function addMonthsISO(isoMonth: string, delta: number): string {
  const base = parseISO(`${isoMonth}-01`);
  return format(addMonths(base, delta), "yyyy-MM");
}

export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
}

/** Minutes to a clean hours reading, e.g. 90 -> "1.5h" */
export function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`;
}
