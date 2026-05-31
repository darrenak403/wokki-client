"use client";

import { cn } from "@/lib/utils";
import type { PreferenceType } from "@/types/schedule-preferences";

const PREFERENCE_STYLES: Record<
  PreferenceType,
  { label: string; className: string }
> = {
  Preferred: {
    label: "Ưu tiên",
    className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  },
  Available: {
    label: "Có thể",
    className: "bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200",
  },
  Unavailable: {
    label: "Không",
    className: "bg-muted text-muted-foreground",
  },
};

export function preferenceTypeLabel(type: PreferenceType): string {
  return PREFERENCE_STYLES[type].label;
}

type PreferenceTypeCellProps = {
  type: PreferenceType | null;
  compact?: boolean;
  showFullLabel?: boolean;
  interactive?: boolean;
  className?: string;
};

export function PreferenceTypeCell({
  type,
  compact,
  showFullLabel,
  interactive,
  className,
}: PreferenceTypeCellProps) {
  const compactClassName = showFullLabel
    ? "min-h-8 min-w-[76px] px-3 text-xs"
    : "size-7 text-[10px]";

  if (!type) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-dashed text-muted-foreground",
          compact ? compactClassName : "min-h-8 min-w-10 px-2 text-xs",
          interactive && "cursor-pointer transition-colors hover:border-brand-blue/50 hover:bg-brand-mist/40",
          className,
        )}
        aria-label="Chưa đăng ký"
      >
        {showFullLabel ? "Trống" : "—"}
      </span>
    );
  }

  const style = PREFERENCE_STYLES[type];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium",
        style.className,
        compact ? compactClassName : "min-h-8 min-w-10 px-2 text-xs",
        interactive && "cursor-pointer transition-opacity hover:opacity-90",
        className,
      )}
      aria-label={style.label}
      title={style.label}
    >
      {compact && !showFullLabel ? style.label.charAt(0) : style.label}
    </span>
  );
}

export function cyclePreferenceType(
  current: PreferenceType | null,
): PreferenceType | null {
  if (current === null) return "Preferred";
  if (current === "Preferred") return "Available";
  return null;
}
