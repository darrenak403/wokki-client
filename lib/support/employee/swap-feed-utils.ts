import { format, formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { SWAP_POST_TYPE, type SwapPostType } from "@/types/employee";

export function initialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatSwapPostRelativeTime(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: vi });
}

export function formatSwapShiftDate(date: string): string {
  return format(parseISO(date), "EEEE, dd/MM/yyyy", { locale: vi });
}

export function formatSwapShiftDateShort(date: string): string {
  return format(parseISO(date), "dd/MM/yyyy", { locale: vi });
}

export function formatSwapShiftTimeRange(startTime: string, endTime: string): string {
  return `${startTime.slice(0, 5)} – ${endTime.slice(0, 5)}`;
}

export function swapPostTypeAccent(type: SwapPostType) {
  if (type === SWAP_POST_TYPE.Cover) {
    return {
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
      shiftBg: "bg-emerald-50/80 dark:bg-emerald-950/20",
      action: "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30",
    };
  }
  return {
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
    shiftBg: "bg-indigo-50/80 dark:bg-indigo-950/20",
    action: "text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30",
  };
}
