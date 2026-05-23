"use client";

import { useMemo, useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PreferenceTypeCell } from "@/components/shared/admin/preference-type-cell";
import { usePreferenceBoardQuery } from "@/hooks/usePreferenceBoard";
import { useScheduleListQuery } from "@/hooks/useSchedule";
import { isScheduleDraft, scheduleStatusLabel } from "@/lib/support/schedule/status";
import { addWeeksISO, toMondayISO, weekDayDates } from "@/lib/support/schedule/week";
import type { SchedulePreferenceBoardResponse } from "@/types/schedule-preferences";

function findCell(
  board: SchedulePreferenceBoardResponse,
  employeeId: string,
  shiftDefinitionId: string,
  date: string
) {
  const row = board.employees.find((e) => e.employeeId === employeeId);
  return (
    row?.cells.find((c) => c.shiftDefinitionId === shiftDefinitionId && c.date === date)
      ?.preferenceType ?? null
  );
}

type PreferenceBoardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  weekStartDate: string;
  /** Sau sao chép tuần — ép board dùng đúng scheduleId tuần đích. */
  scheduleIdHint?: string | null;
  onWeekChange?: (weekStartDate: string) => void;
};

export function PreferenceBoardDialog({
  open,
  onOpenChange,
  departmentId,
  weekStartDate: parentWeekStart,
  scheduleIdHint,
  onWeekChange,
}: PreferenceBoardDialogProps) {
  const [weekStartDate, setWeekStartDate] = useState(parentWeekStart);

  const listParams = open ? { departmentId, weekStartDate } : null;
  const { data: listData, isLoading: listLoading } = useScheduleListQuery(listParams);

  const scheduleForBoard = useMemo(() => {
    const items = listData?.items;
    if (!items?.length) return null;
    return items.find((s) => isScheduleDraft(s.status)) ?? items[0];
  }, [listData]);

  const scheduleId = useMemo(() => {
    if (scheduleForBoard) return scheduleForBoard.id;
    if (scheduleIdHint && weekStartDate === parentWeekStart) return scheduleIdHint;
    return null;
  }, [scheduleForBoard, scheduleIdHint, weekStartDate, parentWeekStart]);

  const selectedSchedule = scheduleForBoard;
  const scheduleBadgeLabel = selectedSchedule
    ? scheduleStatusLabel(selectedSchedule.status)
    : "Lịch Nháp";

  const {
    data: board,
    isLoading: boardLoading,
    isError,
  } = usePreferenceBoardQuery(scheduleId, open && Boolean(scheduleId));

  const weekDays = board ? weekDayDates(board.weekStartDate) : weekDayDates(weekStartDate);
  const shifts = useMemo(
    () =>
      [...(board?.shifts ?? [])].sort((a, b) => {
        const timeCompare = a.startTime.localeCompare(b.startTime);
        return timeCompare !== 0 ? timeCompare : a.shiftName.localeCompare(b.shiftName);
      }),
    [board]
  );

  const weekRangeLabel = useMemo(() => {
    const start = parseISO(weekStartDate);
    return `${format(start, "dd/MM", { locale: vi })} – ${format(addDays(start, 6), "dd/MM/yyyy", { locale: vi })}`;
  }, [weekStartDate]);

  const shiftWeekLabel = useMemo(() => {
    if (!board) return null;
    const start = parseISO(board.weekStartDate);
    return `${format(start, "dd/MM", { locale: vi })} – ${format(addDays(start, 6), "dd/MM/yyyy", { locale: vi })}`;
  }, [board]);

  const changeWeek = (next: string) => {
    setWeekStartDate(next);
    onWeekChange?.(next);
  };

  const canViewAnySchedule = weekStartDate <= toMondayISO(new Date());

  const loading = listLoading || (scheduleId && boardLoading);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="fixed inset-0 top-0 left-0 flex h-dvh w-dvw max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 ring-0 sm:max-w-none"
      >
        <DialogHeader className="shrink-0 gap-4 border-b px-4 py-4 pr-14 sm:px-6 sm:pr-20">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="max-w-4xl space-y-1">
              <DialogTitle className="text-lg">Bảng đăng ký ca</DialogTitle>
              <DialogDescription>
                Theo dõi đăng ký theo <strong>lịch Nháp của tuần đang chọn</strong> — chỉ xem (nhân
                viên tự sửa trên tab Đăng ký ca trong Lịch của tôi).
              </DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Badge variant="secondary">{scheduleBadgeLabel}</Badge>
              {board ? (
                <Badge variant="outline">
                  {board.submittedCount}/{board.employeeCount} đã gửi
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Tuần</span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Tuần trước"
                onClick={() => changeWeek(addWeeksISO(weekStartDate, -1))}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <span className="min-w-[140px] text-center text-sm font-medium">
                {weekRangeLabel}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Tuần sau"
                onClick={() => changeWeek(addWeeksISO(weekStartDate, 1))}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
            {shiftWeekLabel && shiftWeekLabel !== weekRangeLabel ? (
              <span className="text-xs text-muted-foreground">Dữ liệu lịch: {shiftWeekLabel}</span>
            ) : null}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Đang tải bảng đăng ký…</p>
          ) : !scheduleId ? (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
              <p className="max-w-md text-sm text-muted-foreground">
                {canViewAnySchedule ? (
                  <>Tuần {weekRangeLabel} chưa có lịch, nên chưa hiển thị bảng đăng ký ca.</>
                ) : (
                  <>
                    Tuần {weekRangeLabel} chưa có lịch <strong>Nháp</strong>, nên chưa hiển thị bảng
                    đăng ký ca.
                  </>
                )}
              </p>
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">Không tải được bảng đăng ký.</p>
          ) : !board ? null : (
            <ScrollArea className="h-full w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 min-w-[190px] bg-background">
                      Nhân viên
                    </TableHead>
                    <TableHead className="sticky left-[190px] z-10 min-w-[120px] bg-background">
                      Ca
                    </TableHead>
                    {weekDays.map((date) => (
                      <TableHead key={date} className="min-w-[130px] text-center text-xs">
                        <div className="font-medium">
                          {format(parseISO(date), "EEEE", { locale: vi })}
                        </div>
                        <div className="text-muted-foreground">
                          {format(parseISO(date), "dd/MM", { locale: vi })}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {board.employees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2 + weekDays.length}
                        className="text-center text-muted-foreground"
                      >
                        Chưa có nhân viên trong phòng ban.
                      </TableCell>
                    </TableRow>
                  ) : (
                    board.employees.flatMap((emp) =>
                      shifts.map((shift, shiftIndex) => (
                        <TableRow
                          key={`${emp.employeeId}-${shift.shiftDefinitionId}`}
                          className={shiftIndex === 0 ? "border-t" : "border-t-0"}
                        >
                          {shiftIndex === 0 ? (
                            <TableCell
                              rowSpan={shifts.length}
                              className="sticky left-0 z-10 bg-background align-middle"
                            >
                              <div className="font-medium">{emp.employeeName}</div>
                              <div className="text-xs text-muted-foreground">{emp.position}</div>
                              {emp.status ? (
                                <Badge variant="outline" className="mt-1 text-[10px]">
                                  {emp.status === "Submitted" ? "Đã gửi" : "Nháp"}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="mt-1 text-[10px]">
                                  Chưa đăng ký
                                </Badge>
                              )}
                            </TableCell>
                          ) : null}
                          <TableCell className="sticky left-[190px] z-10 bg-background text-sm text-muted-foreground">
                            {shift.shiftName}
                          </TableCell>
                          {weekDays.map((date) => (
                            <TableCell
                              key={`${emp.employeeId}-${shift.shiftDefinitionId}-${date}`}
                              className="text-center"
                            >
                              <PreferenceTypeCell
                                type={findCell(
                                  board,
                                  emp.employeeId,
                                  shift.shiftDefinitionId,
                                  date
                                )}
                                compact
                                showFullLabel
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </div>

        <div className="shrink-0 border-t px-4 py-3 sm:px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
