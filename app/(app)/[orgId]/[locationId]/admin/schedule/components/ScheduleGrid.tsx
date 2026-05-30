"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { PlusIcon } from "lucide-react";
import { AssignEmployeeDialog } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/AssignEmployeeDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { useDeleteAssignmentMutation } from "@/hooks/useSchedule";
import { useShiftsQuery } from "@/hooks/useShifts";
import { cn } from "@/lib/utils";
import { isScheduleEditable } from "@/lib/support/schedule/status";
import { weekDayDates } from "@/lib/support/schedule/week";
import { format, parseISO } from "date-fns";
import type { ShiftAssignmentResponse, ScheduleStatus } from "@/types/schedule";

const DAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

type ScheduleGridProps = {
  scheduleId: string;
  departmentId: string;
  locationId: string;
  weekStartDate: string;
  status: ScheduleStatus;
  assignments: ShiftAssignmentResponse[];
};

function timeToMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.slice(0, 5).split(":");
  return Number(hours) * 60 + Number(minutes);
}

function getAssignmentKey(shiftDefinitionId: string, date: string) {
  return `${shiftDefinitionId}|${date}`;
}

function shiftPillStyle(color: string): CSSProperties {
  return {
    backgroundColor: `color-mix(in srgb, ${color} 22%, white)`,
    borderColor: `color-mix(in srgb, ${color} 38%, white)`,
    color: `color-mix(in srgb, ${color} 72%, #0b1e3d)`,
    boxShadow: `0 1px 2px color-mix(in srgb, ${color} 18%, transparent)`,
  };
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
    [shifts]
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
      <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950/30">
        <div className="overflow-x-auto">
          <Table className="min-w-[1120px]">
            <TableHeader>
              <TableRow className="border-neutral-100 hover:bg-transparent dark:border-neutral-800">
                <TableHead className="sticky left-0 z-10 min-w-[180px] bg-neutral-50/80 dark:bg-neutral-900/80">
                  Khung ca
                </TableHead>
                {days.map((date, index) => (
                  <TableHead
                    key={date}
                    className="min-w-[130px] bg-neutral-50/80 text-left dark:bg-neutral-900/80"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {DAY_HEADERS[index]}
                    </div>
                    <div className="text-base font-semibold text-foreground">
                      {format(parseISO(date), "dd/MM")}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeShifts.map((shift) => {
                const color = shift.color || "#1d4d8f";

                return (
                  <TableRow key={shift.id} className="border-neutral-100 dark:border-neutral-800">
                    <TableCell className="sticky left-0 z-10 bg-white align-top dark:bg-neutral-900">
                      <div className="flex items-center gap-2 py-1">
                        <span
                          className="size-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-neutral-900"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-foreground">{shift.name}</span>
                      </div>
                    </TableCell>
                    {days.map((date) => {
                      const cellAssignments =
                        assignmentsByKey.get(getAssignmentKey(shift.id, date)) ?? [];
                      const hasAssignments = cellAssignments.length > 0;

                      return (
                        <TableCell
                          key={`${shift.id}-${date}`}
                          className="align-top bg-white dark:bg-neutral-900"
                        >
                          <div className="min-h-[88px] space-y-1.5 py-0.5">
                            {hasAssignments ? (
                              cellAssignments.map((assignment) => (
                                <button
                                  type="button"
                                  key={assignment.id}
                                  className={cn(
                                    "block w-full truncate rounded-lg border px-2.5 py-2 text-left text-sm font-semibold transition-shadow",
                                    editable &&
                                      "hover:brightness-95 hover:ring-1 hover:ring-destructive/30"
                                  )}
                                  style={shiftPillStyle(color)}
                                  disabled={!editable || deleteMutation.isPending}
                                  title={editable ? "Bấm để xóa phân ca" : undefined}
                                  onClick={() => void handleDelete(assignment.id)}
                                >
                                  {employeeNameById.get(assignment.employeeId) ?? "Nhân viên"}
                                </button>
                              ))
                            ) : editable ? (
                              <button
                                type="button"
                                aria-label="Thêm nhân viên"
                                className={cn(
                                  "group flex min-h-[72px] w-full items-center justify-center rounded-lg border border-transparent transition-colors",
                                  "hover:border-dashed hover:border-neutral-200 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50",
                                )}
                                onClick={() =>
                                  setDialog({
                                    shiftDefinitionId: shift.id,
                                    shiftName: shift.name,
                                    date,
                                  })
                                }
                              >
                                <PlusIcon className="size-4 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground" />
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}

                            {hasAssignments && editable ? (
                              <button
                                type="button"
                                aria-label="Thêm nhân viên"
                                className="flex size-6 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-neutral-100 hover:text-brand-blue dark:hover:bg-neutral-800"
                                onClick={() =>
                                  setDialog({
                                    shiftDefinitionId: shift.id,
                                    shiftName: shift.name,
                                    date,
                                  })
                                }
                              >
                                <PlusIcon className="size-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
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
