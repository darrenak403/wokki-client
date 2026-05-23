"use client";

import { useMemo, useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { AssignEmployeeDialog } from "@/app/(app)/admin/schedule/components/AssignEmployeeDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { useDeleteAssignmentMutation } from "@/hooks/useSchedule";
import { useShiftsQuery } from "@/hooks/useShifts";
import { cn } from "@/lib/utils";
import { isScheduleEditable } from "@/lib/support/schedule/status";
import { weekDayDates } from "@/lib/support/schedule/week";
import { format, parseISO } from "date-fns";
import type { ShiftDefinitionResponse } from "@/types/foundation";
import type { ShiftAssignmentResponse, ScheduleStatus } from "@/types/schedule";

const DAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const PX_PER_MINUTE = 1.05;
const MIN_SHIFT_HEIGHT = 92;
const DEFAULT_START = 8 * 60;
const DEFAULT_END = 22 * 60;

type ScheduleGridProps = {
  scheduleId: string;
  departmentId: string;
  locationId: string;
  weekStartDate: string;
  status: ScheduleStatus;
  assignments: ShiftAssignmentResponse[];
};

type TimeBounds = {
  start: number;
  end: number;
};

function timeToMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.slice(0, 5).split(":");
  return Number(hours) * 60 + Number(minutes);
}

function formatHour(minutes: number) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:00`;
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function getShiftEndMinutes(shift: ShiftDefinitionResponse) {
  const start = timeToMinutes(shift.startTime);
  const end = timeToMinutes(shift.endTime);
  return end <= start ? end + 1440 : end;
}

function getTimeBounds(shifts: ShiftDefinitionResponse[]): TimeBounds {
  if (shifts.length === 0) {
    return { start: DEFAULT_START, end: DEFAULT_END };
  }

  const starts = shifts.map((shift) => timeToMinutes(shift.startTime));
  const ends = shifts.map(getShiftEndMinutes);
  const start = Math.max(0, Math.floor(Math.min(...starts) / 60) * 60 - 60);
  const end = Math.ceil(Math.max(...ends) / 60) * 60 + 60;

  return { start, end: Math.max(end, start + 4 * 60) };
}

function getAssignmentKey(shiftDefinitionId: string, date: string) {
  return `${shiftDefinitionId}|${date}`;
}

export function ScheduleGrid({
  scheduleId,
  departmentId,
  locationId,
  weekStartDate,
  status,
  assignments,
}: ScheduleGridProps) {
  const listParams = { departmentId, weekStartDate };
  const editable = isScheduleEditable(status);
  const days = weekDayDates(weekStartDate);
  const [dialog, setDialog] = useState<{
    shiftDefinitionId: string;
    shiftName: string;
    date: string;
  } | null>(null);

  const { data: shifts = [], isLoading: shiftsLoading } = useShiftsQuery({
    locationId,
    departmentId,
  });
  const { data: employeesPage } = useEmployeesQuery({
    departmentId,
    pageSize: 100,
  });
  const deleteMutation = useDeleteAssignmentMutation(scheduleId, listParams);

  const activeShifts = useMemo(
    () =>
      shifts
        .filter((shift) => shift.isActive)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
    [shifts],
  );

  const employeeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const employee of employeesPage?.items ?? []) {
      map.set(employee.id, `${employee.firstName} ${employee.lastName}`);
    }
    return map;
  }, [employeesPage?.items]);

  const assignmentsByKey = useMemo(() => {
    const map = new Map<string, ShiftAssignmentResponse[]>();
    for (const assignment of assignments) {
      const key = getAssignmentKey(assignment.shiftDefinitionId, assignment.date);
      const list = map.get(key) ?? [];
      list.push(assignment);
      map.set(key, list);
    }
    return map;
  }, [assignments]);

  const timeBounds = useMemo(() => getTimeBounds(activeShifts), [activeShifts]);
  const hours = useMemo(() => {
    const values: number[] = [];
    for (let hour = timeBounds.start; hour <= timeBounds.end; hour += 60) {
      values.push(hour);
    }
    return values;
  }, [timeBounds]);

  const calendarHeight = (timeBounds.end - timeBounds.start) * PX_PER_MINUTE;

  const handleDelete = async (assignmentId: string) => {
    if (!window.confirm("Xóa phân ca này?")) return;
    await deleteMutation.mutateAsync(assignmentId);
  };

  if (shiftsLoading) {
    return <p className="text-sm text-muted-foreground">Đang tải ca làm việc...</p>;
  }

  if (activeShifts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-background p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có ca làm việc cho phòng ban này. Thêm ca tại mục ca làm việc.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="grid grid-cols-[72px_repeat(7,minmax(150px,1fr))] border-b bg-muted/30">
          <div className="border-r px-3 py-4 text-xs font-medium text-muted-foreground">Giờ</div>
          {days.map((date, index) => (
            <div key={date} className="border-r px-3 py-3 last:border-r-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {DAY_HEADERS[index]}
              </div>
              <div className="text-lg font-semibold">{format(parseISO(date), "dd/MM")}</div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid min-w-[1120px] grid-cols-[72px_repeat(7,minmax(150px,1fr))]"
            style={{ height: calendarHeight }}
          >
            <div className="relative border-r bg-muted/15">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t px-2 pt-1 text-[11px] font-medium text-muted-foreground"
                  style={{ top: (hour - timeBounds.start) * PX_PER_MINUTE }}
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {days.map((date) => (
              <div key={date} className="relative border-r last:border-r-0">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="pointer-events-none absolute left-0 right-0 border-t"
                    style={{ top: (hour - timeBounds.start) * PX_PER_MINUTE }}
                  />
                ))}

                {activeShifts.map((shift) => {
                  const start = timeToMinutes(shift.startTime);
                  const end = getShiftEndMinutes(shift);
                  const top = (start - timeBounds.start) * PX_PER_MINUTE;
                  const height = Math.max(MIN_SHIFT_HEIGHT, (end - start) * PX_PER_MINUTE);
                  const cellAssignments =
                    assignmentsByKey.get(getAssignmentKey(shift.id, date)) ?? [];
                  const color = shift.color || "#2563eb";

                  return (
                    <section
                      key={shift.id}
                      className={cn(
                        "absolute left-2 right-2 overflow-hidden rounded-lg border bg-background shadow-sm transition-shadow",
                        editable && "hover:shadow-md",
                      )}
                      style={{
                        top,
                        height,
                        borderColor: color,
                        backgroundColor: `${color}0f`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 border-b bg-background/85 px-3 py-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{shift.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimeRange(shift.startTime, shift.endTime)}
                          </div>
                        </div>
                        {editable ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-7 shrink-0 rounded-full"
                            onClick={() =>
                              setDialog({
                                shiftDefinitionId: shift.id,
                                shiftName: shift.name,
                                date,
                              })
                            }
                          >
                            <PlusIcon className="size-4" />
                            <span className="sr-only">Phân ca</span>
                          </Button>
                        ) : null}
                      </div>

                      <div className="space-y-1.5 overflow-y-auto p-2" style={{ maxHeight: height - 48 }}>
                        {cellAssignments.length > 0 ? (
                          cellAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="group flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-1.5 text-sm shadow-xs"
                            >
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {employeeNameById.get(assignment.employeeId) ?? "Nhân viên"}
                                </div>
                                {assignment.note ? (
                                  <div className="truncate text-xs text-muted-foreground">
                                    {assignment.note}
                                  </div>
                                ) : null}
                              </div>
                              {editable ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="size-7 shrink-0 opacity-70 hover:opacity-100"
                                  disabled={deleteMutation.isPending}
                                  onClick={() => void handleDelete(assignment.id)}
                                >
                                  <Trash2Icon className="size-3.5" />
                                  <span className="sr-only">Xóa phân ca</span>
                                </Button>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <button
                            type="button"
                            disabled={!editable}
                            className={cn(
                              "flex min-h-10 w-full items-center justify-center rounded-md border border-dashed bg-background/70 px-2 text-xs font-medium text-muted-foreground",
                              editable && "hover:border-primary/40 hover:text-foreground",
                            )}
                            onClick={() =>
                              setDialog({
                                shiftDefinitionId: shift.id,
                                shiftName: shift.name,
                                date,
                              })
                            }
                          >
                            {editable ? "Thêm nhân viên" : "Chưa phân ca"}
                          </button>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">Nháp: có thể phân ca</Badge>
        <Badge variant="outline">Đã công bố: nhân viên chỉ xem</Badge>
      </div>

      {dialog ? (
        <AssignEmployeeDialog
          open
          onOpenChange={(open) => !open && setDialog(null)}
          scheduleId={scheduleId}
          listParams={listParams}
          shiftDefinitionId={dialog.shiftDefinitionId}
          shiftName={dialog.shiftName}
          date={dialog.date}
        />
      ) : null}
    </>
  );
}
