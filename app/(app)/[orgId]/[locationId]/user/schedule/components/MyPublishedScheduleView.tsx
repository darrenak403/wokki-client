"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDaysIcon, ChevronDownIcon, LayoutListIcon, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import { cn } from "@/lib/utils";
import { DayCard } from "./DayCard";
import { WeekGridView } from "./WeekGridView";
import { buildDayGroups, getRelativeStart, getUpcoming, toTime } from "./my-schedule-utils";

export function MyPublishedScheduleView() {
  const { data: assignments = [], isLoading, isError, error, dataUpdatedAt } = useMyScheduleQuery();
  const [now, setNow] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const [pastExpanded, setPastExpanded] = useState(false);

  const { upcoming, todayGroups, upcomingGroups, pastGroups } = useMemo(() => {
    const allGroups = buildDayGroups(assignments, now);
    return {
      upcoming: getUpcoming(assignments, now),
      todayGroups: allGroups.filter((g) => g.isToday),
      upcomingGroups: allGroups.filter((g) => !g.isToday && !g.isPast),
      pastGroups: allGroups.filter((g) => g.isPast),
    };
  }, [assignments, now]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Đang tải lịch…</p>;
  }

  if (isError) {
    return <p className="text-sm text-destructive">{mapEmployeeError(error)}</p>;
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có ca nào trong 28 ngày tới. Trưởng ca cần công bố lịch trước.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border bg-primary px-3 py-2.5 text-primary-foreground shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-foreground/70">
              Ca sắp tới
            </p>
            <ZapIcon className="size-4 text-primary-foreground/70" aria-hidden />
          </div>
          {upcoming ? (
            <div className="mt-2">
              <p className="text-sm font-semibold leading-tight">{upcoming.shiftName}</p>
              <p className="mt-0.5 text-xs text-primary-foreground/75">
                {isSameDay(parseISO(upcoming.date), now)
                  ? "Hôm nay"
                  : format(parseISO(upcoming.date), "EEEE, dd/MM", { locale: vi })}
                , {toTime(upcoming.startTime)} – {toTime(upcoming.endTime)}
              </p>
              <p className="mt-1 text-[11px] text-primary-foreground/65">
                {getRelativeStart(upcoming, now)}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-primary-foreground/75">Không còn ca sắp tới.</p>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-lg font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {assignments.length}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Tổng ca (28 ngày)
            </p>
            <p className="text-sm font-medium leading-tight">Tổng số ca làm</p>
          </div>
        </div>

      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-base font-semibold tracking-tight">Lịch làm việc chi tiết</h2>
          <div className="flex items-center gap-1 rounded-lg border p-0.5">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => setViewMode("list")}
              aria-label="Chế độ danh sách"
            >
              <LayoutListIcon className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => setViewMode("calendar")}
              aria-label="Chế độ lịch"
            >
              <CalendarDaysIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="space-y-4">
            {/* Hôm nay */}
            {todayGroups.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Hôm nay</p>
                {todayGroups.map((group) => (
                  <DayCard key={group.dateKey} group={group} now={now} />
                ))}
              </div>
            )}

            {/* Sắp tới */}
            {upcomingGroups.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sắp tới</p>
                {upcomingGroups.map((group) => (
                  <DayCard key={group.dateKey} group={group} now={now} />
                ))}
              </div>
            )}

            {/* Đã qua — collapsible */}
            {pastGroups.length > 0 && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPastExpanded((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  <ChevronDownIcon
                    className={cn("size-3.5 transition-transform", pastExpanded && "rotate-180")}
                  />
                  Đã qua ({pastGroups.length} ngày)
                </button>
                {pastExpanded &&
                  pastGroups.map((group) => (
                    <DayCard key={group.dateKey} group={group} now={now} />
                  ))}
              </div>
            )}
          </div>
        ) : (
          <WeekGridView assignments={assignments} now={now} />
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-xs text-muted-foreground">
        <span>Dữ liệu được bảo mật bởi Wokki Security System</span>
        {dataUpdatedAt ? (
          <span>Cập nhật lần cuối: {format(new Date(dataUpdatedAt), "HH:mm dd/MM/yyyy")}</span>
        ) : null}
      </div>
    </div>
  );
}
