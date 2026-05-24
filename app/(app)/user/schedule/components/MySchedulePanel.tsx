"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  differenceInMinutes,
  eachDayOfInterval,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDaysIcon, ClockIcon, MapPinIcon, ShieldCheckIcon, ZapIcon } from "lucide-react";
import { MyPreferencesTab } from "@/app/(app)/user/schedule/components/MyPreferencesTab";
import { NoEmployeeLinked } from "@/app/(app)/user/components/NoEmployeeLinked";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function getAssignmentsForDate(assignments: ShiftAssignmentResponse[], date: Date) {
  const dateKey = format(date, "yyyy-MM-dd");
  return assignments
    .filter((assignment) => assignment.date === dateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function MyPublishedScheduleView() {
  const { data: assignments = [], isLoading, isError, error, dataUpdatedAt } = useMyScheduleQuery();
  const now = useMemo(() => new Date(), []);
  const todayRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    todayRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const upcoming = getUpcoming(assignments, now);
  const weeklyCount = assignments.filter((assignment) => {
    const date = parseISO(assignment.date);
    return date >= weekStart && date <= weekEnd;
  }).length;

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
            <p className="text-xs font-semibold uppercase text-primary-foreground/70">
              Ca sắp tới
            </p>
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
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Tổng ca (28 ngày)
          </p>
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

        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Ca làm</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weekDays.flatMap((date) => {
                const items = getAssignmentsForDate(assignments, date);
                const today = isSameDay(date, now);
                const isPast = !today && isBefore(date, now);
                const dateLabel = (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium", today && "text-primary")}>
                        {format(date, "EEEE", { locale: vi })}
                      </span>
                      {today ? (
                        <Badge className="h-5 rounded-md px-2 text-[11px]">Hôm nay</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{format(date, "dd/MM")}</p>
                  </div>
                );

                if (items.length === 0) {
                  return [
                    <TableRow key={date.toISOString()} className={cn(isPast && "opacity-50")}>
                      <TableCell>{dateLabel}</TableCell>
                      <TableCell className="font-medium italic text-muted-foreground">
                        Ngày nghỉ
                      </TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell className="text-muted-foreground">Không có ca</TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                    </TableRow>,
                  ];
                }

                return items.map((assignment, index) => (
                  <TableRow
                    key={assignment.id}
                    ref={today && index === 0 ? todayRowRef : undefined}
                    className={cn(isPast && "opacity-50")}
                  >
                    <TableCell>{index === 0 ? dateLabel : null}</TableCell>
                    <TableCell>
                      <div
                        className="border-l-4 pl-3 font-medium text-brand-navy dark:text-foreground"
                        style={{ borderColor: assignment.shiftColor ?? "#5068a9" }}
                      >
                        {assignment.shiftName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <ClockIcon className="size-4 text-muted-foreground" />
                        {toTime(assignment.startTime)} - {toTime(assignment.endTime)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {assignment.locationName ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon className="size-4 text-muted-foreground" />
                          {assignment.locationName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="gap-1 rounded-md border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                      >
                        <ShieldCheckIcon className="size-3" />
                        Đã công bố
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assignment.note ? (
                        <Badge variant="outline" className="rounded-md">
                          {assignment.note}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-xs text-muted-foreground">
        <span> Dữ liệu được bảo mật bởi Wokki Security System</span>
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
