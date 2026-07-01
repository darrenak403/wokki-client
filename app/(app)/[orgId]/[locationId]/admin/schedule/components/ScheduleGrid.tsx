"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { AssignEmployeeDialog } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/AssignEmployeeDialog";
import {
  CalendarEmptySlot,
  WeekShiftCalendar,
} from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/WeekShiftCalendar";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { useDeleteAssignmentMutation } from "@/hooks/useSchedule";
import { useTeamAttendanceQuery } from "@/hooks/useAttendance";
import { useShiftsQuery } from "@/hooks/useShifts";
import { cn } from "@/lib/utils";
import { isScheduleEditable } from "@/lib/support/schedule/status";
import { shiftAccentColor, shiftChipStyle } from "@/lib/support/schedule/shift-calendar";
import { weekDayDates } from "@/lib/support/schedule/week";
import type { AttendanceResponse } from "@/types/employee";
import type { ShiftAssignmentResponse, ScheduleStatus } from "@/types/schedule";

type AttendanceChipStatus = "active" | "done" | "absent";

function getAttendanceStatus(record: AttendanceResponse | undefined): AttendanceChipStatus {
  if (!record) return "absent";
  if (record.clockOut) return "done";
  return "active";
}

const STATUS_CONFIG: Record<
  AttendanceChipStatus,
  { dot: string; label: string }
> = {
  active: { dot: "bg-emerald-500", label: "Đang trong ca" },
  done:   { dot: "bg-slate-400",   label: "Đã tan ca" },
  absent: { dot: "bg-amber-400",   label: "Chưa vào ca" },
};

function AttendanceStatusDot({ status }: { status: AttendanceChipStatus }) {
  const { dot, label } = STATUS_CONFIG[status];
  return (
    <span className="mt-0.5 flex items-center gap-1">
      <span className={cn("inline-block size-1.5 rounded-full shrink-0", dot)} />
      <span className="text-[10px] font-normal opacity-75 truncate">{label}</span>
    </span>
  );
}

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

  const todayStr = new Date().toISOString().slice(0, 10);
  const weekIncludesToday = days.includes(todayStr);

  const { data: shifts = [], isLoading: shiftsLoading } = useShiftsQuery({
    locationId,
    departmentId,
  });
  const { data: employeesPage } = useEmployeesQuery({
    departmentId,
    pageSize: 100,
  });
  const deleteMutation = useDeleteAssignmentMutation(scheduleId, listParams);

  // Fetch today's attendance only when today falls within the displayed week
  const { data: todayAttendancePage } = useTeamAttendanceQuery(
    { fromDate: todayStr, toDate: todayStr, pageSize: 200 },
    weekIncludesToday,
  );

  const attendanceByAssignmentId = useMemo(() => {
    const map = new Map<string, AttendanceResponse>();
    for (const record of todayAttendancePage?.items ?? []) {
      if (record.assignmentId) map.set(record.assignmentId, record);
    }
    return map;
  }, [todayAttendancePage]);

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

  const openAssign = (shiftDefinitionId: string, shiftName: string, date: string) => {
    setDialog({ shiftDefinitionId, shiftName, date });
  };

  const handleDelete = async (assignmentId: string) => {
    if (!window.confirm("Xóa phân ca này?")) return;
    await deleteMutation.mutateAsync(assignmentId);
  };

  if (shiftsLoading) {
    return <p className="text-sm text-muted-foreground">Đang tải ca làm việc...</p>;
  }

  if (activeShifts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có ca làm việc cho phòng ban này. Thêm ca tại mục ca làm việc.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <WeekShiftCalendar
          className="min-w-[960px]"
          days={days}
          shifts={activeShifts}
          renderCell={(shift, date) => {
            const color = shiftAccentColor(shift.color);
            const cellAssignments = assignmentsByKey.get(getAssignmentKey(shift.id, date)) ?? [];
            const hasAssignments = cellAssignments.length > 0;

            if (!hasAssignments) {
              if (!editable) {
                return <CalendarEmptySlot label="—" />;
              }
              return (
                <button
                  type="button"
                  aria-label="Thêm nhân viên"
                  className={cn(
                    "group flex min-h-[64px] flex-1 w-full flex-col items-center justify-center gap-1 rounded-xl",
                    "border border-dashed border-border/45 bg-background/50 transition-all",
                    "hover:border-primary/35 hover:bg-primary/[0.04]",
                  )}
                  onClick={() => openAssign(shift.id, shift.name, date)}
                >
                  <PlusIcon className="size-4 text-muted-foreground/35 transition-colors group-hover:text-primary/70" />
                  <span className="text-[10px] font-medium text-muted-foreground/0 transition-all group-hover:text-muted-foreground">
                    Phân ca
                  </span>
                </button>
              );
            }

            return (
              <>
                {cellAssignments.map((assignment) => {
                  const isToday = date === todayStr;
                  const attendanceStatus = isToday
                    ? getAttendanceStatus(attendanceByAssignmentId.get(assignment.id))
                    : null;
                  return (
                    <button
                      type="button"
                      key={assignment.id}
                      className={cn(
                        "block w-full rounded-lg border px-2.5 py-2 text-left text-sm font-semibold transition-all",
                        editable && "hover:brightness-[0.97] hover:ring-1 hover:ring-destructive/25",
                      )}
                      style={shiftChipStyle(color)}
                      disabled={!editable || deleteMutation.isPending}
                      title={editable ? "Bấm để xóa phân ca" : undefined}
                      onClick={() => void handleDelete(assignment.id)}
                    >
                      <span className="truncate block">
                        {employeeNameById.get(assignment.employeeId) ?? "Nhân viên"}
                      </span>
                      {attendanceStatus ? (
                        <AttendanceStatusDot status={attendanceStatus} />
                      ) : null}
                    </button>
                  );
                })}
                {editable ? (
                  <button
                    type="button"
                    aria-label="Thêm nhân viên"
                    className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[11px] font-medium text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary"
                    onClick={() => openAssign(shift.id, shift.name, date)}
                  >
                    <PlusIcon className="size-3" />
                    Thêm
                  </button>
                ) : null}
              </>
            );
          }}
        />
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
