"use client";

import { useEffect, useMemo, useState } from "react";
import {
  differenceInMinutes,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDaysIcon, ClockIcon, MapPinIcon, ShieldCheckIcon, ZapIcon } from "lucide-react";
import { MyPreferencesTab } from "@/app/(app)/user/schedule/components/MyPreferencesTab";
import { NoEmployeeLinked } from "@/app/(app)/user/components/NoEmployeeLinked";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/api";
import type { ShiftAssignmentResponse } from "@/types/employee";

function toTime(value: string): string {
  return value.slice(0, 5);
}

function assignmentStart(assignment: ShiftAssignmentResponse): Date {
  return parseISO(`${assignment.date}T${toTime(assignment.startTime)}:00`);
}

function assignmentEnd(assignment: ShiftAssignmentResponse): Date {
  return parseISO(`${assignment.date}T${toTime(assignment.endTime)}:00`);
}

function getRelativeStart(assignment: ShiftAssignmentResponse, now: Date): string {
  const start = assignmentStart(assignment);
  const end = assignmentEnd(assignment);

  if (now >= start && now <= end) return "Đang diễn ra";

  const minutes = differenceInMinutes(start, now);
  if (minutes < 0) return "Đã qua";
  if (minutes < 60) return `Sắp bắt đầu trong ${minutes} phút`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Sắp bắt đầu trong ${hours} giờ`;

  const days = Math.round(hours / 24);
  return `Sắp bắt đầu trong ${days} ngày`;
}

function getUpcoming(assignments: ShiftAssignmentResponse[], now: Date) {
  return [...assignments]
    .filter((assignment) => assignmentEnd(assignment) >= now)
    .sort((a, b) => assignmentStart(a).getTime() - assignmentStart(b).getTime())[0];
}

function isOngoing(assignment: ShiftAssignmentResponse, now: Date): boolean {
  return now >= assignmentStart(assignment) && now <= assignmentEnd(assignment);
}

interface DayGroup {
  dateKey: string;
  date: Date;
  isPast: boolean;
  isToday: boolean;
  assignments: ShiftAssignmentResponse[];
}

function buildDayGroups(assignments: ShiftAssignmentResponse[], now: Date): DayGroup[] {
  const map = new Map<string, ShiftAssignmentResponse[]>();
  for (const a of assignments) {
    const list = map.get(a.date) ?? [];
    list.push(a);
    map.set(a.date, list);
  }

  const todayStart = startOfDay(now);

  const groups: DayGroup[] = Array.from(map.entries()).map(([dateKey, items]) => {
    const date = parseISO(dateKey);
    const isToday = isSameDay(date, now);
    const isPast = !isToday && isBefore(date, todayStart);
    return {
      dateKey,
      date,
      isPast,
      isToday,
      assignments: items.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    };
  });

  const upcoming = groups.filter((g) => !g.isPast).sort((a, b) => a.date.getTime() - b.date.getTime());
  const past = groups.filter((g) => g.isPast).sort((a, b) => a.date.getTime() - b.date.getTime());

  return [...upcoming, ...past];
}

function DayCard({ group, now }: { group: DayGroup; now: Date }) {
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
            <div key={assignment.id} className="flex items-center gap-3 px-4 py-3">
              <div
                className="self-stretch w-1 shrink-0 rounded-full"
                style={{ backgroundColor: assignment.shiftColor ?? "#5068a9" }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm leading-tight">{assignment.shiftName}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="size-3.5" />
                    {toTime(assignment.startTime)} - {toTime(assignment.endTime)}
                  </span>
                  {ongoing && (
                    <Badge
                      variant="secondary"
                      className="h-5 rounded-md px-2 text-[11px] bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    >
                      Đang diễn ra
                    </Badge>
                  )}
                </div>
              </div>

              {assignment.locationName && (
                <span className="hidden sm:inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                  <MapPinIcon className="size-3.5" />
                  {assignment.locationName}
                </span>
              )}

              <Badge
                variant="outline"
                className="shrink-0 gap-1 rounded-md border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <ShieldCheckIcon className="size-3" />
                Đã công bố
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyPublishedScheduleView() {
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

export function MySchedulePanel() {
  const { isError, error } = useMyScheduleQuery();
  const errorCode =
    isError && error && typeof error === "object" && "messageCode" in error
      ? (error as unknown as ApiError).messageCode
      : undefined;
  const noEmployee = errorCode === "ME_NO_EMPLOYEE";

  if (noEmployee) {
    return <NoEmployeeLinked />;
  }

  return (
    <Tabs defaultValue="published" className="space-y-6">
      <TabsList>
        <TabsTrigger value="published">Lịch đã công bố</TabsTrigger>
        <TabsTrigger value="preferences">Đăng ký ca</TabsTrigger>
      </TabsList>
      <TabsContent value="published" className="mt-4">
        <MyPublishedScheduleView />
      </TabsContent>
      <TabsContent value="preferences" className="mt-4">
        <MyPreferencesTab />
      </TabsContent>
    </Tabs>
  );
}
