"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssignEmployeeDialog } from "@/app/(app)/admin/schedule/components/assign-employee-dialog";
import { AssignmentCell } from "@/app/(app)/admin/schedule/components/assignment-cell";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { useShiftsQuery } from "@/hooks/useShifts";
import { weekDayDates } from "@/lib/support/schedule/week";
import { format, parseISO } from "date-fns";
import type { ShiftAssignmentResponse, ScheduleStatus } from "@/types/schedule";
import { isScheduleEditable } from "@/lib/support/schedule/status";

const DAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

type ScheduleGridProps = {
  scheduleId: string;
  departmentId: string;
  locationId: string;
  weekStartDate: string;
  status: ScheduleStatus;
  assignments: ShiftAssignmentResponse[];
};

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
  const { data: shifts = [], isLoading: shiftsLoading } = useShiftsQuery({
    locationId,
    departmentId,
  });
  const { data: employeesPage } = useEmployeesQuery({
    departmentId,
    pageSize: 100,
  });

  const activeShifts = shifts.filter((s) => s.isActive);

  const employeeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of employeesPage?.items ?? []) {
      map.set(e.id, `${e.firstName} ${e.lastName}`);
    }
    return map;
  }, [employeesPage?.items]);

  const assignmentsByKey = useMemo(() => {
    const map = new Map<string, ShiftAssignmentResponse[]>();
    for (const a of assignments) {
      const key = `${a.shiftDefinitionId}|${a.date}`;
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    return map;
  }, [assignments]);

  const [dialog, setDialog] = useState<{
    shiftDefinitionId: string;
    shiftName: string;
    date: string;
  } | null>(null);

  if (shiftsLoading) {
    return <p className="text-sm text-muted-foreground">Đang tải ca định nghĩa…</p>;
  }

  if (activeShifts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có ca định nghĩa cho phòng ban này. Thêm ca tại mục Ca định nghĩa.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px] sticky left-0 bg-background z-10">
                Ca
              </TableHead>
              {days.map((date, i) => (
                <TableHead key={date} className="min-w-[100px] text-center">
                  <span className="block font-medium">{DAY_HEADERS[i]}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {format(parseISO(date), "dd/MM")}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeShifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell className="sticky left-0 bg-background font-medium text-sm">
                  <div>{shift.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    {shift.startTime.slice(0, 5)} – {shift.endTime.slice(0, 5)}
                  </div>
                </TableCell>
                {days.map((date) => {
                  const key = `${shift.id}|${date}`;
                  const cellAssignments = assignmentsByKey.get(key) ?? [];
                  return (
                    <TableCell key={key} className="align-top p-1.5">
                      <AssignmentCell
                        assignments={cellAssignments}
                        scheduleId={scheduleId}
                        listParams={listParams}
                        editable={editable}
                        employeeNameById={employeeNameById}
                        onAdd={() =>
                          setDialog({
                            shiftDefinitionId: shift.id,
                            shiftName: shift.name,
                            date,
                          })
                        }
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
