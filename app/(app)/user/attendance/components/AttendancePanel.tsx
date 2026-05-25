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
import { OTClockOutButton } from "@/app/(app)/user/attendance/components/OTClockOutButton";
import { OTRequestForm } from "@/app/(app)/user/attendance/components/OTRequestForm";
import { NoEmployeeLinked } from "@/app/(app)/user/components/NoEmployeeLinked";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { useMyOTRequestsQuery } from "@/hooks/useOvertimeRequests";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/api";
import { type AttendanceResponse } from "@/types/employee";
import { OVERTIME_STATUS } from "@/types/overtime";
import type { ShiftAssignmentResponse } from "@/types/schedule";
import {
  toTime,
  formatMinutes,
  formatDurationShort,
  getClockInStatus,
  getTodayShiftStatus,
  isShiftEnded,
} from "./attendance-utils";

export function AttendancePanel() {
  const {
    data: assignments = [],
    isError: scheduleError,
    error: scheduleErr,
  } = useMyScheduleQuery();
  const { data: history = [], isLoading: historyLoading } = useAttendanceHistoryQuery();
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();
  const openRecord = useOpenAttendanceRecord();
  const { data: myOTPage } = useMyOTRequestsQuery();
  const myOTRequests = myOTPage?.items ?? [];
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [showOTForm, setShowOTForm] = useState(false);

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
    [assignments]
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

  const activeOTRequest = myOTRequests.find(
    (r) =>
      r.shiftAssignmentId === currentShift?.id &&
      (r.status === OVERTIME_STATUS.Pending || r.status === OVERTIME_STATUS.PendingApproval)
  );
  const pendingOTRequest = myOTRequests.find(
    (r) => r.shiftAssignmentId === currentShift?.id && r.status === OVERTIME_STATUS.Pending
  );
  const hasAttendanceForShift =
    !!openRecord || history.some((r) => r.assignmentId === currentShift?.id);
  const canRequestOT =
    isShiftEnded(currentShift, now) && hasAttendanceForShift && !activeOTRequest && !!currentShift;
  const todayStatus = selectedShiftEnded
    ? "Đã quá giờ clock in"
    : getTodayShiftStatus(openRecord, currentShift);

  const shiftRecord = currentShift
    ? history.find((r) => r.assignmentId === currentShift.id)
    : null;
  const workedMinutes = openRecord
    ? differenceInMinutes(now, parseISO(openRecord.clockIn))
    : shiftRecord?.clockOut
    ? shiftRecord.workedMinutes
    : null;
  const workedDisplay = workedMinutes !== null ? formatDurationShort(workedMinutes) : null;

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
              <p className="text-xs font-semibold uppercase text-muted-foreground">Ca hôm nay</p>
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
              <p className="text-4xl font-semibold tabular-nums">
                {workedDisplay ?? <span className="text-muted-foreground/40">--:--</span>}
              </p>
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

          <div className="mt-20 flex flex-col gap-3">
            {pendingOTRequest ? (
              <OTClockOutButton
                overtimeRequestId={pendingOTRequest.id}
                startedAt={pendingOTRequest.startedAt}
              />
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row">
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
              {!openRecord ? (
                <Button type="button" size="lg" variant="outline" className="h-12 sm:w-24" disabled>
                  <TimerIcon className="size-5" />
                </Button>
              ) : null}
            </div>
          </div>
          {canRequestOT ? (
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                onClick={() => setShowOTForm(true)}
              >
                <TimerIcon className="size-4" />
                Yêu cầu tăng ca
              </Button>
              <Sheet open={showOTForm} onOpenChange={setShowOTForm}>
                <SheetContent side="right" className="rounded-t-2xl pb-8">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Yêu cầu tăng ca</SheetTitle>
                  </SheetHeader>
                  <OTRequestForm
                    shiftAssignmentId={currentShift!.id}
                    onSuccess={() => setShowOTForm(false)}
                  />
                </SheetContent>
              </Sheet>
            </div>
          ) : null}
        </div>

        <aside className="rounded-lg border bg-muted/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground">Ca trong ngày</h2>
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
                  const otRequest = myOTRequests.find(
                    (r) => r.shiftAssignmentId === row.assignmentId
                  );
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
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className={cn("border", status.className)}>
                            {status.label}
                          </Badge>
                          {row.autoClosed ? (
                            <Badge
                              variant="outline"
                              className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400"
                            >
                              Tự động đóng
                            </Badge>
                          ) : null}
                          {otRequest ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "border",
                                otRequest.status === OVERTIME_STATUS.Pending &&
                                  "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                                otRequest.status === OVERTIME_STATUS.PendingApproval &&
                                  "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
                                otRequest.status === OVERTIME_STATUS.Approved &&
                                  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
                                otRequest.status === OVERTIME_STATUS.Rejected &&
                                  "border-destructive/30 bg-destructive/10 text-destructive"
                              )}
                            >
                              {otRequest.status === OVERTIME_STATUS.Pending && "OT đang mở"}
                              {otRequest.status === OVERTIME_STATUS.PendingApproval &&
                                "OT chờ duyệt"}
                              {otRequest.status === OVERTIME_STATUS.Approved && "OT đã duyệt"}
                              {otRequest.status === OVERTIME_STATUS.Rejected && "OT bị từ chối"}
                            </Badge>
                          ) : null}
                        </div>
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
