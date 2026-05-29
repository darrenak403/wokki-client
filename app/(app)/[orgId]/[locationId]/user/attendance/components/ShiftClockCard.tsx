"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDaysIcon, CheckCircle2Icon, ClockIcon, LogInIcon, LogOutIcon, TimerIcon } from "lucide-react";
import { OTRequestForm } from "@/app/(app)/[orgId]/[locationId]/user/attendance/components/OTRequestForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AttendanceResponse } from "@/types/employee";
import type { ShiftAssignmentResponse } from "@/types/schedule";
import { toTime } from "./attendance-utils";

interface Props {
  currentShift: ShiftAssignmentResponse | undefined;
  openRecord: AttendanceResponse | undefined;
  /** Set when this shift already has a closed attendance record (clock-out done). */
  closedRecord?: AttendanceResponse;
  workedDisplay: string | null;
  canClockIn: boolean;
  canClockOut: boolean;
  selectedShiftEnded: boolean;
  actionPending: boolean;
  clockInPending: boolean;
  clockOutPending: boolean;
  canRequestOT: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
}

export function ShiftClockCard({
  currentShift,
  openRecord,
  closedRecord,
  workedDisplay,
  canClockIn,
  canClockOut,
  selectedShiftEnded,
  actionPending,
  clockInPending,
  clockOutPending,
  canRequestOT,
  onClockIn,
  onClockOut,
}: Props) {
  const [showOTForm, setShowOTForm] = useState(false);

  return (
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
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {openRecord ? "Đang làm" : workedDisplay ? "Tổng giờ làm việc" : "Giờ làm ca"}
          </p>
          <p className="mt-1 text-4xl font-semibold tabular-nums">
            {workedDisplay ?? <span className="text-muted-foreground/40">--:--</span>}
          </p>
        </div>
      </div>

      {openRecord ? (
        <div className="mt-6 grid gap-3 rounded-lg border bg-muted/40 p-3 text-sm sm:grid-cols-3">
          <span className="text-muted-foreground">Đã vào ca</span>
          <span className="font-medium sm:col-span-2">
            {format(parseISO(openRecord.clockIn), "HH:mm, EEEE dd/MM", { locale: vi })}
          </span>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        {openRecord ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="destructive"
              className="h-12 flex-1 text-base"
              disabled={!canClockOut || actionPending}
              onClick={onClockOut}
            >
              <LogOutIcon className="size-5" />
              {clockOutPending ? "Đang tan ca…" : "Tan ca"}
            </Button>
            <Button type="button" size="lg" variant="outline" className="h-12 sm:w-24" disabled>
              <TimerIcon className="size-5" />
            </Button>
          </div>
        ) : closedRecord ? (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1">
              <p className="font-medium text-emerald-900 dark:text-emerald-100">Ca đã hoàn thành</p>
              <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                Đã chấm đủ giờ
                {closedRecord.clockIn && closedRecord.clockOut
                  ? ` · Vào ${format(parseISO(closedRecord.clockIn), "HH:mm")} · Tan ${format(parseISO(closedRecord.clockOut), "HH:mm")}`
                  : null}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 flex-1 text-base"
              disabled={!canClockIn || selectedShiftEnded || actionPending}
              onClick={onClockIn}
            >
              <LogInIcon className="size-5" />
              {clockInPending ? "Đang vào ca…" : "Vào ca"}
            </Button>
            <Button type="button" size="lg" variant="outline" className="h-12 sm:w-24" disabled>
              <TimerIcon className="size-5" />
            </Button>
          </div>
        )}
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
  );
}
