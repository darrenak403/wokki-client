"use client";

import { useEffect, useMemo, useState } from "react";
import { endOfWeek, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import { ZapIcon } from "lucide-react";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import { DayCard } from "./DayCard";
import { buildDayGroups, getRelativeStart, getUpcoming, toTime } from "./my-schedule-utils";

export function MyPublishedScheduleView() {
  const { data: assignments = [], isLoading, isError, error, dataUpdatedAt } = useMyScheduleQuery();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { weeklyCount, upcoming, dayGroups } = useMemo(() => {
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    return {
      weeklyCount: assignments.filter((a) => {
        const d = parseISO(a.date);
        return d >= weekStart && d <= weekEnd;
      }).length,
      upcoming: getUpcoming(assignments, now),
      dayGroups: buildDayGroups(assignments, now),
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
      <section className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border bg-primary px-3 py-2.5 text-primary-foreground shadow-sm sm:col-span-1">
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

        <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-lg font-semibold text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
            {weeklyCount}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Tuần này
            </p>
            <p className="text-sm font-medium leading-tight">Ca làm tuần này</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="border-b pb-2">
          <h2 className="text-base font-semibold tracking-tight">Lịch làm việc chi tiết</h2>
        </div>

        <div className="space-y-3">
          {dayGroups.map((group) => (
            <DayCard key={group.dateKey} group={group} now={now} />
          ))}
        </div>
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
