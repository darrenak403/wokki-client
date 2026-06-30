"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShiftAssignmentResponse } from "@/types/employee";

const HOUR_HEIGHT = 56;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function timeToMinutes(time: string): number {
  const [h = "0", m = "0"] = time.slice(0, 5).split(":");
  return Number(h) * 60 + Number(m);
}

function minutesToPx(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

function hourLabel(h: number): string {
  if (h === 0) return "";
  if (h < 12) return `${h} SA`;
  if (h === 12) return "12 CH";
  return `${h - 12} CH`;
}

interface WeekGridViewProps {
  assignments: ShiftAssignmentResponse[];
  now: Date;
}

export function WeekGridView({ assignments, now }: WeekGridViewProps) {
  const [selectedDate, setSelectedDate] = useState(() => now);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = HOUR_HEIGHT * 6;
    }
  }, []);

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const isToday = isSameDay(selectedDate, now);

  const dayAssignments = useMemo(
    () =>
      assignments
        .filter((a) => a.date === dateKey)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [assignments, dateKey],
  );

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowPx = minutesToPx(nowMinutes);

  const dayLabel = format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi });

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => setSelectedDate((d) => addDays(d, -1))}
          aria-label="Ngày trước"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <button
          type="button"
          onClick={() => setSelectedDate(now)}
          className={cn(
            "text-sm font-semibold transition-colors hover:text-foreground",
            isToday ? "text-primary" : "text-foreground/80",
          )}
        >
          {isToday ? "Hôm nay · " : ""}
          {dayLabel}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
          aria-label="Ngày sau"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: 480 }}>
        <div className="relative grid" style={{ gridTemplateColumns: "44px 1fr" }}>
          {/* Time labels */}
          <div className="relative border-r">
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex items-start justify-end pr-1.5"
                style={{ height: HOUR_HEIGHT }}
              >
                {h > 0 && (
                  <span className="-mt-2 text-[9px] text-muted-foreground">
                    {hourLabel(h)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div
            className={cn("relative", isToday && "bg-primary/[0.02]")}
            style={{ height: HOUR_HEIGHT * 24 }}
          >
            {/* Hour lines */}
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute inset-x-0 border-b border-border/40"
                style={{ top: h * HOUR_HEIGHT }}
              />
            ))}

            {/* Current time indicator */}
            {isToday && (
              <div
                className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                style={{ top: nowPx }}
              >
                <span className="-ml-[3px] size-2 shrink-0 rounded-full bg-red-500" />
                <div className="h-px flex-1 bg-red-500" />
              </div>
            )}

            {/* Shift event blocks */}
            {dayAssignments.length === 0 ? (
              <div
                className="absolute inset-x-2 flex items-center justify-center rounded-lg border border-dashed"
                style={{ top: HOUR_HEIGHT * 7, height: HOUR_HEIGHT * 3 }}
              >
                <p className="text-sm text-muted-foreground">Không có ca làm</p>
              </div>
            ) : (
              dayAssignments.map((a) => {
                const startMin = timeToMinutes(a.startTime);
                const endMin = timeToMinutes(a.endTime);
                const top = minutesToPx(startMin);
                const height = Math.max(minutesToPx(endMin - startMin) - 2, 28);
                const color = a.shiftColor ?? "#5068a9";
                const ongoing = isToday && nowMinutes >= startMin && nowMinutes <= endMin;

                return (
                  <div
                    key={a.id}
                    className="absolute inset-x-2 z-20 overflow-hidden rounded-lg px-3 py-2"
                    style={{
                      top: top + 1,
                      height,
                      backgroundColor: color + "18",
                      borderLeft: `4px solid ${color}`,
                    }}
                  >
                    <p className="truncate text-sm font-semibold leading-tight" style={{ color }}>
                      {a.shiftName}
                    </p>
                    {height >= 36 && (
                      <p className="mt-0.5 text-xs opacity-75" style={{ color }}>
                        {a.startTime.slice(0, 5)} – {a.endTime.slice(0, 5)}
                      </p>
                    )}
                    {ongoing && height >= 56 && (
                      <span
                        className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium"
                        style={{ color }}
                      >
                        <span className="size-1.5 animate-pulse rounded-full bg-current" />
                        Đang diễn ra
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
