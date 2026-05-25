"use client";

import { useEffect, useMemo, useState } from "react";
import { endOfWeek, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDaysIcon, ZapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Lịch đã công bố — {assignments.length} phân ca trong 28 ngày tới.
        </p>
        <Badge variant="outline" className="h-9 gap-2 rounded-lg px-3 text-sm">
          <CalendarDaysIcon className="size-4 text-primary" />
          {format(now, "MMMM yyyy", { locale: vi })}
        </Badge>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-primary p-5 text-primary-foreground shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase text-primary-foreground/70">Ca sắp tới</p>
            <ZapIcon className="size-5 text-primary-foreground/70" />
          </div>
          {upcoming ? (
            <div className="mt-8 space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{upcoming.shiftName}</h2>
                <p className="mt-1 text-sm text-primary-foreground/75">
                  {isSameDay(parseISO(upcoming.date), now)
                    ? "Hôm nay"
                    : format(parseISO(upcoming.date), "EEEE, dd/MM", { locale: vi })}
                  , {toTime(upcoming.startTime)} - {toTime(upcoming.endTime)}
                </p>
              </div>
              <div className="border-t border-primary-foreground/20 pt-4 text-sm text-primary-foreground/75">
                {getRelativeStart(upcoming, now)}
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm text-primary-foreground/75">Không còn ca sắp tới.</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Tổng ca (28 ngày)</p>
          <div className="mt-8 flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-lg bg-emerald-100 text-2xl font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {assignments.length}
            </span>
            <div>
              <p className="font-semibold">Tổng số ca làm</p>
              <p className="text-sm text-muted-foreground">Lịch đã được công bố</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Tuần này</p>
          <div className="mt-8 flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-lg bg-orange-100 text-2xl font-semibold text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
              {weeklyCount}
            </span>
            <div>
              <p className="font-semibold">Ca làm tuần này</p>
              <p className="text-sm text-muted-foreground">Từ Thứ Hai đến Chủ Nhật</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="border-b pb-3">
          <h2 className="text-lg font-semibold tracking-tight">Lịch làm việc chi tiết</h2>
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
