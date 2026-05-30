import type { CSSProperties } from "react";

export const WEEK_DAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;

export function formatShiftTimeRange(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)} – ${endTime.slice(0, 5)}`;
}

export function shiftAccentColor(color: string | null | undefined) {
  return color?.trim() || "#1d4d8f";
}

/** Tinted chip for employee / suggestion inside a cell */
export function shiftChipStyle(color: string): CSSProperties {
  return {
    backgroundColor: `color-mix(in srgb, ${color} 18%, white)`,
    borderColor: `color-mix(in srgb, ${color} 32%, transparent)`,
    color: `color-mix(in srgb, ${color} 78%, #0f172a)`,
    boxShadow: `inset 3px 0 0 ${color}`,
  };
}

export function dayColumnTone(dayIndex: number) {
  if (dayIndex === 6) return "weekend" as const;
  if (dayIndex === 5) return "saturday" as const;
  return "weekday" as const;
}

export function dayColumnClass(dayIndex: number) {
  const tone = dayColumnTone(dayIndex);
  if (tone === "weekend") return "bg-rose-50/40 dark:bg-rose-950/15";
  if (tone === "saturday") return "bg-amber-50/30 dark:bg-amber-950/10";
  return "bg-background";
}
