"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ClockIcon, MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type DayGroup, isOngoing, toTime } from "./my-schedule-utils";

export type { DayGroup };

export function DayCard({ group, now }: { group: DayGroup; now: Date }) {
  const dayLabel = format(group.date, "EEEE", { locale: vi });
  const dayShort = format(group.date, "dd/MM");

  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", group.isPast && "opacity-60")}>
      <div className="border-b px-4 py-3">
        <span className={cn("font-semibold", group.isToday && "text-primary")}>
          {dayLabel} {dayShort}
        </span>
        {group.isToday && (
          <Badge className="ml-2 h-5 rounded-md px-2 text-[11px]">Hôm nay</Badge>
        )}
      </div>

      <div className="divide-y">
        {group.assignments.map((assignment) => {
          const ongoing = isOngoing(assignment, now);
          return (
            <div
              key={assignment.id}
              className={cn(
                "flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap",
                ongoing && "bg-emerald-50/60 dark:bg-emerald-950/20",
              )}
            >
              <div
                className="self-stretch w-1 shrink-0 rounded-full"
                style={{ backgroundColor: assignment.shiftColor ?? "#5068a9" }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm leading-tight">
                  {assignment.shiftName}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="size-3.5 shrink-0" />
                    {toTime(assignment.startTime)} – {toTime(assignment.endTime)}
                  </span>
                  {ongoing && (
                    <Badge className="h-5 rounded-md px-2 text-[11px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Đang diễn ra
                    </Badge>
                  )}
                </div>
              </div>

              {assignment.locationName && (
                <span className="hidden min-w-0 shrink-0 items-center gap-1 truncate text-sm text-muted-foreground sm:inline-flex">
                  <MapPinIcon className="size-3.5 shrink-0" />
                  <span className="truncate">{assignment.locationName}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
