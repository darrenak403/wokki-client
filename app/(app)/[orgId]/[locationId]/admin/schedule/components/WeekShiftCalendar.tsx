"use client";

import type { ReactNode } from "react";
import { format, isToday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  dayColumnClass,
  formatShiftTimeRange,
  shiftAccentColor,
  WEEK_DAY_HEADERS,
} from "@/lib/support/schedule/shift-calendar";

export type WeekShiftCalendarShift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color?: string | null;
};

type WeekShiftCalendarProps = {
  days: string[];
  shifts: WeekShiftCalendarShift[];
  fillHeight?: boolean;
  className?: string;
  renderCell: (shift: WeekShiftCalendarShift, date: string, dayIndex: number) => ReactNode;
};

const GRID_TEMPLATE = "grid-cols-[minmax(148px,188px)_repeat(7,minmax(0,1fr))]";

export function WeekShiftCalendar({
  days,
  shifts,
  fillHeight = false,
  className,
  renderCell,
}: WeekShiftCalendarProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-card",
        "ring-1 ring-border/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)]",
        fillHeight && "h-full min-h-[320px]",
        className,
      )}
    >
      {/* Day header */}
      <div
        className={cn(
          "sticky top-0 z-20 grid shrink-0 border-b border-border/60 bg-muted/50 backdrop-blur-md",
          GRID_TEMPLATE,
        )}
      >
        <div className="flex items-end border-r border-border/50 px-3 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Khung ca
          </span>
        </div>
        {days.map((date, index) => {
          const today = isToday(parseISO(date));
          return (
            <div
              key={date}
              className={cn(
                "border-r border-border/40 px-2 py-2.5 text-center last:border-r-0",
                dayColumnClass(index),
              )}
            >
              <div
                className={cn(
                  "mx-auto inline-flex flex-col items-center gap-0.5 rounded-lg px-2 py-1",
                  today && "bg-primary/10 ring-1 ring-primary/20",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground",
                    today && "text-primary",
                  )}
                >
                  {WEEK_DAY_HEADERS[index]}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums text-foreground",
                    today && "text-primary",
                  )}
                >
                  {format(parseISO(date), "dd/MM")}
                </span>
                {today ? (
                  <span className="rounded-full bg-primary px-1.5 py-px text-[9px] font-bold text-primary-foreground">
                    Hôm nay
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shift rows — flex-1 so rows expand and fill vertical space */}
      <div className={cn("flex flex-col divide-y divide-border/50", fillHeight && "min-h-0 flex-1")}>
        {shifts.map((shift) => {
          const accent = shiftAccentColor(shift.color);
          return (
            <div
              key={shift.id}
              className={cn("grid min-h-[88px]", GRID_TEMPLATE, fillHeight && "min-h-0 flex-1")}
            >
              {/* Shift label */}
              <div
                className="relative flex flex-col justify-center border-r border-border/50 bg-muted/20 px-3 py-3"
                style={{ boxShadow: `inset 4px 0 0 ${accent}` }}
              >
                <p className="truncate text-sm font-semibold leading-tight text-foreground">
                  {shift.name}
                </p>
                <p className="mt-1 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {formatShiftTimeRange(shift.startTime, shift.endTime)}
                </p>
              </div>

              {/* Day cells */}
              {days.map((date, dayIndex) => (
                <div
                  key={`${shift.id}-${date}`}
                  className={cn(
                    "relative border-r border-border/30 p-2 last:border-r-0",
                    "transition-colors hover:bg-muted/25",
                    dayColumnClass(dayIndex),
                    fillHeight && "flex min-h-0 flex-col",
                  )}
                >
                  <div className={cn("space-y-1.5", fillHeight && "flex min-h-0 flex-1 flex-col")}>
                    {renderCell(shift, date, dayIndex)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Empty slot placeholder for calendar cells */
export function CalendarEmptySlot({ label = "Trống" }: { label?: string }) {
  return (
    <div className="flex min-h-[64px] flex-1 items-center justify-center rounded-xl border border-dashed border-border/50 bg-background/40">
      <span className="text-[11px] font-medium text-muted-foreground/45">{label}</span>
    </div>
  );
}
