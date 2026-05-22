"use client";

import { useEffect, useMemo, useState } from "react";
import { differenceInMinutes, format, isToday, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDaysIcon,
  ClockIcon,
  LogInIcon,
  LogOutIcon,
  MapPinIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react";
import { NoEmployeeLinked } from "@/app/(app)/user/components/no-employee-linked";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAttendanceHistoryQuery,
  useClockInMutation,
  useClockOutMutation,
  useOpenAttendanceRecord,
} from "@/hooks/useAttendance";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/api";
import { ATTENDANCE_STATUS, type AttendanceResponse } from "@/types/employee";
import type { ShiftAssignmentResponse } from "@/types/schedule";

function toTime(value?: string | null): string {
  return value?.slice(0, 5) ?? "--:--";
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
}

function getClockInStatus(row: AttendanceResponse) {
  if (row.status === ATTENDANCE_STATUS.Adjusted) {
    return {
      label: "Đã chỉnh",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    };
  }

  if (row.status === ATTENDANCE_STATUS.Open) {
    return {
      label: "Đang mở",
      className: "bg-primary/10 text-primary border-primary/20",
    };
  }

  if (row.status === ATTENDANCE_STATUS.Late) {
    return {
      label: "Đi trễ",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    };
  }

  return {
    label: "Đúng giờ",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  };
}

function getTodayShiftStatus(openRecord: AttendanceResponse | null, currentShift?: ShiftAssignmentResponse) {
  if (!currentShift) return "Không có ca hôm nay";
  if (!openRecord) return "Sẵn sàng chấm công";

  const expected = parseISO(`${currentShift.date}T${toTime(currentShift.startTime)}:00`);
  const actual = parseISO(openRecord.clockIn);
  const lateMinutes = differenceInMinutes(actual, expected);
  if (lateMinutes > 0) return `Đã vào trễ ${lateMinutes} phút`;
  return "Đang trong ca";
}

function isShiftEnded(shift: ShiftAssignmentResponse | undefined, now: Date): boolean {
  if (!shift) return false;
  return now > parseISO(`${shift.date}T${toTime(shift.endTime)}:00`);
}

export function AttendancePanel() {
  const { data: assignments = [], isError: scheduleError, error: scheduleErr } =
    useMyScheduleQuery();
  const { data: history = [], isLoading: historyLoading } = useAttendanceHistoryQuery();
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();
  const openRecord = useOpenAttendanceRecord();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const scheduleErrorCode =
    scheduleError && scheduleErr && typeof scheduleErr === "object" && "messageCode" in scheduleErr
      ? (scheduleErr as unknown as ApiError).messageCode
      : undefined;

  const todayShifts = useMemo(
    () => assignments.filter((a) => isToday(parseISO(a.date))),
    [assignments],
  );
  const selectedShift =
    todayShifts.find((shift) => shift.id === selectedAssignmentId) ?? todayShifts[0];
  const currentShift =
    todayShifts.find((shift) => shift.id === openRecord?.assignmentId) ?? selectedShift;
  const monthLabel = format(now, "MMMM", { locale: vi });
  const closedHistory = history.filter((row) => row.clockOut !== null);
  const totalWorkedMinutes = closedHistory.reduce((total, row) => total + row.workedMinutes, 0);

  if (scheduleErrorCode === "ME_NO_EMPLOYEE") {
    return <NoEmployeeLinked />;
  }

  const handleClockIn = async () => {
    if (todayShifts.length > 1) {
      if (!selectedAssignmentId) return;
      await clockInMutation.mutateAsync({ assignmentId: selectedAssignmentId });
      return;
    }
    if (todayShifts.length === 1) {
      await clockInMutation.mutateAsync({ assignmentId: todayShifts[0].id });
      return;
    }
    await clockInMutation.mutateAsync({});
  };

  const canClockIn = !openRecord && todayShifts.length > 0;
  const canClockOut = Boolean(openRecord);
  const needsShiftPick = todayShifts.length > 1;
  const actionPending = clockInMutation.isPending || clockOutMutation.isPending;
  const selectedShiftEnded = !openRecord && isShiftEnded(currentShift, now);
  const todayStatus = selectedShiftEnded
    ? "Đã quá giờ clock in"
    : getTodayShiftStatus(openRecord, currentShift);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm">
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ backgroundColor: currentShift ? "#5068a9" : "var(--border)" }}
          />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Ca hôm nay
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                {currentShift ? currentShift.shiftName : "Chưa có ca được công bố"}
              </h2>
              {currentShift ? (
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="size-4" />
                    {toTime(currentShift.startTime)} – {toTime(currentShift.endTime)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDaysIcon className="size-4" />
                    {format(parseISO(currentShift.date), "EEEE, dd/MM", { locale: vi })}
                  </span>
                </div>
              ) : (
                <p className="max-w-lg text-sm text-muted-foreground">
                  Không có ca đã công bố hôm nay nên bạn chưa thể chấm công.
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-4xl font-semibold tabular-nums">{format(now, "HH:mm")}</p>
              <Badge
                variant="outline"
                className={cn(
                  "mt-2 border",
                  openRecord
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {todayStatus}
              </Badge>
            </div>
          </div>

          {needsShiftPick ? (
            <div className="mt-6 max-w-md">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Chọn ca để chấm công
              </label>
              <select
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                aria-label="Chọn ca để chấm công"
              >
                <option value="">Chọn ca hôm nay</option>
                {todayShifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shiftName} · {toTime(s.startTime)} – {toTime(s.endTime)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {openRecord ? (
            <div className="mt-6 grid gap-3 rounded-lg border bg-muted/40 p-3 text-sm sm:grid-cols-3">
              <span className="text-muted-foreground">Đã clock in</span>
              <span className="font-medium sm:col-span-2">
                {format(parseISO(openRecord.clockIn), "HH:mm, EEEE dd/MM", { locale: vi })}
              </span>
            </div>
          ) : null}

          <div className="mt-20 flex flex-col gap-3 sm:flex-row">
            {openRecord ? (
              <Button
                size="lg"
                variant="destructive"
                className="h-12 flex-1 text-base"
                disabled={!canClockOut || actionPending}
                onClick={() => void clockOutMutation.mutateAsync()}
              >
                <LogOutIcon className="size-5" />
                {clockOutMutation.isPending ? "Đang clock out…" : "Clock out"}
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-12 flex-1 text-base"
                disabled={
                  !canClockIn ||
                  selectedShiftEnded ||
                  actionPending ||
                  (needsShiftPick && !selectedAssignmentId)
                }
                onClick={() => void handleClockIn()}
              >
                <LogInIcon className="size-5" />
                {clockInMutation.isPending ? "Đang clock in…" : "Clock in"}
              </Button>
            )}
            <Button type="button" size="lg" variant="outline" className="h-12 sm:w-24" disabled>
              <TimerIcon className="size-5" />
            </Button>
          </div>
        </div>

        <aside className="rounded-lg border bg-muted/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground">
              Ca trong ngày
            </h2>
            <UsersIcon className="size-4 text-muted-foreground" />
          </div>
          {todayShifts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Chưa có ca hôm nay.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {todayShifts.map((shift) => {
                const active = shift.id === currentShift?.id;
                return (
                  <li
                    key={shift.id}
                    className={cn(
                      "rounded-lg border bg-card p-3",
                      active ? "border-primary/40" : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{shift.shiftName}</p>
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          active ? "bg-primary" : "bg-muted-foreground/40"
                        )}
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {toTime(shift.startTime)} – {toTime(shift.endTime)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Bản ghi tháng này</p>
          <p className="mt-2 text-2xl font-semibold">{history.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tổng giờ đã đóng</p>
          <p className="mt-2 text-2xl font-semibold">{formatMinutes(totalWorkedMinutes)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Bản ghi đang mở</p>
          <p className="mt-2 text-2xl font-semibold">{openRecord ? "1" : "0"}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Lịch sử chấm công — {monthLabel}
            </h2>
            <p className="text-sm text-muted-foreground">
              Hiển thị clock in/out trong tháng hiện tại.
            </p>
          </div>
        </div>
        {historyLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có bản ghi chấm công.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Ca</TableHead>
                  <TableHead>Clock in</TableHead>
                  <TableHead>Clock out</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => {
                  const status = getClockInStatus(row);
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(parseISO(row.clockIn), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-52 items-start gap-2">
                          <span
                            className="mt-1.5 size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: row.shiftColor ?? "#5068a9" }}
                          />
                          <div>
                            <p className="font-medium">{row.shiftName ?? "Ca làm việc"}</p>
                            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span>
                                {toTime(row.scheduledStartTime)} – {toTime(row.scheduledEndTime)}
                              </span>
                              {row.locationName ? (
                                <span className="inline-flex items-center gap-1">
                                  <MapPinIcon className="size-3" />
                                  {row.locationName}
                                </span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">
                        {format(parseISO(row.clockIn), "HH:mm")}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {row.clockOut ? format(parseISO(row.clockOut), "HH:mm") : "—"}
                      </TableCell>
                      <TableCell>{row.clockOut ? formatMinutes(row.workedMinutes) : "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border", status.className)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
