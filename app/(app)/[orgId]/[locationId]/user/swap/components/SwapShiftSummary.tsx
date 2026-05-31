"use client";

import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  formatSwapShiftDateShort,
  formatSwapShiftTimeRange,
  swapPostTypeAccent,
} from "@/lib/support/employee/swap-feed-utils";
import { cn } from "@/lib/utils";
import type { SwapPostShiftDto, SwapPostType } from "@/types/employee";

type SwapShiftSummaryProps = {
  shift: SwapPostShiftDto;
  type: SwapPostType;
  className?: string;
};

export function SwapShiftSummary({ shift, type, className }: SwapShiftSummaryProps) {
  const accent = swapPostTypeAccent(type);
  const weekday = format(parseISO(shift.date), "EEE", { locale: vi });
  const timeRange = formatSwapShiftTimeRange(shift.startTime, shift.endTime);

  return (
    <div
      className={cn(
        "rounded-lg px-3 py-2.5",
        accent.shiftBg,
        className,
      )}
    >
      <p className="font-medium leading-snug">{shift.shiftName}</p>
      <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
        {weekday}, {formatSwapShiftDateShort(shift.date)} · {timeRange}
      </p>
    </div>
  );
}
