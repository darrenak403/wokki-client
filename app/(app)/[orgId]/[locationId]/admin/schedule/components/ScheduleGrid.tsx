"use client";

import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { PlusIcon } from "lucide-react";
import { AssignEmployeeDialog } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/AssignEmployeeDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CalendarEmptySlot,
  WeekShiftCalendar,
} from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/WeekShiftCalendar";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { useDeleteAssignmentMutation, useMoveAssignmentMutation } from "@/hooks/useSchedule";
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

function parseAssignmentKey(key: string): DragData | null {
  const [shiftDefinitionId = "", date = ""] = key.split("|");
  return shiftDefinitionId && date ? { shiftDefinitionId, date } : null;
}

type DragData = { shiftDefinitionId: string; date: string };

function DroppableCell({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-full flex-1 flex-col gap-1.5 rounded-xl transition-colors",
        isOver && "bg-primary/[0.06] ring-2 ring-primary/30",
      )}
    >
      {children}
    </div>
  );
}

function DraggableAssignmentChip({
  assignmentId,
  data,
  disabled,
  className,
  style,
  title,
  onClick,
  children,
}: {
  assignmentId: string;
  data: DragData;
  disabled: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: assignmentId,
    data,
    disabled,
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      className={cn(
        className,
        !disabled && "cursor-grab touch-none",
        isDragging && "relative z-30 cursor-grabbing opacity-85 shadow-lg ring-2 ring-primary/40",
      )}
      style={{
        ...style,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
  const moveMutation = useMoveAssignmentMutation(scheduleId, listParams);

  // Click fires after a drag's pointerup; suppress it so a drop never triggers delete.
  const suppressClickRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragStart = () => {
    suppressClickRef.current = true;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    const { active, over } = event;
    if (!over) return;
    const target = parseAssignmentKey(String(over.id));
    const source = active.data.current as DragData | undefined;
    if (!target || !source) return;
    if (source.shiftDefinitionId === target.shiftDefinitionId && source.date === target.date) return;
    moveMutation.mutate({ assignmentId: String(active.id), data: target });
  };

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

  const handleDelete = (assignmentId: string) => {
    if (suppressClickRef.current) return;
    setPendingDeleteId(assignmentId);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    await deleteMutation.mutateAsync(pendingDeleteId);
    setPendingDeleteId(null);
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
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <WeekShiftCalendar
            className="min-w-[960px]"
            days={days}
            shifts={activeShifts}
            renderCell={(shift, date) => {
              const color = shiftAccentColor(shift.color);
              const cellKey = getAssignmentKey(shift.id, date);
              const cellAssignments = assignmentsByKey.get(cellKey) ?? [];
              const hasAssignments = cellAssignments.length > 0;

              if (!hasAssignments && !editable) {
                return <CalendarEmptySlot label="—" />;
              }

              return (
                <DroppableCell id={cellKey} disabled={!editable}>
                  {!hasAssignments ? (
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
                  ) : (
                    <>
                      {cellAssignments.map((assignment) => {
                        const isToday = date === todayStr;
                        const attendanceStatus = isToday
                          ? getAttendanceStatus(attendanceByAssignmentId.get(assignment.id))
                          : null;
                        return (
                          <DraggableAssignmentChip
                            key={assignment.id}
                            assignmentId={assignment.id}
                            data={{ shiftDefinitionId: shift.id, date }}
                            disabled={!editable || deleteMutation.isPending || moveMutation.isPending}
                            className={cn(
                              "block w-full rounded-lg border px-2.5 py-2 text-left text-sm font-semibold transition-all",
                              editable && "hover:brightness-[0.97] hover:ring-1 hover:ring-destructive/25",
                            )}
                            style={shiftChipStyle(color)}
                            title={editable ? "Bấm để xóa · Kéo để chuyển ca" : undefined}
                            onClick={() => handleDelete(assignment.id)}
                          >
                            <span className="truncate block">
                              {employeeNameById.get(assignment.employeeId) ?? "Nhân viên"}
                            </span>
                            {attendanceStatus ? (
                              <AttendanceStatusDot status={attendanceStatus} />
                            ) : null}
                          </DraggableAssignmentChip>
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
                  )}
                </DroppableCell>
              );
            }}
          />
        </DndContext>
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

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phân ca này?</AlertDialogTitle>
            <AlertDialogDescription>
              Nhân viên sẽ không còn được phân vào ca này trong lịch nháp. Bạn có thể phân lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => void confirmDelete()}
            >
              {deleteMutation.isPending ? "Đang xoá…" : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
