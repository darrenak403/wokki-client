"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DepartmentSelect } from "@/components/shared/admin/department-select";
import { LocationSelect } from "@/components/shared/admin/location-select";
import { useAdjustAttendanceMutation, useTeamAttendanceQuery } from "@/hooks/useAttendance";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import { addWeeksISO, toMondayISO, weekRangeFromMonday } from "@/lib/support/schedule/week";
import type { AttendanceResponse } from "@/types/employee";

function toLocalInputValue(iso: string): string {
  const d = parseISO(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(value: string): string {
  return new Date(value).toISOString();
}

export function TeamAttendancePanel() {
  const { session, setLocationId, setDepartmentId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;
  const [weekStartDate, setWeekStartDate] = useState(() => toMondayISO(new Date()));
  const [adjustRow, setAdjustRow] = useState<AttendanceResponse | null>(null);
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [adjustmentNote, setAdjustmentNote] = useState("");

  const { startDate, endDate } = weekRangeFromMonday(weekStartDate);

  const listParams = useMemo(
    () =>
      departmentId
        ? { page: 1, pageSize: 50, fromDate: startDate, toDate: endDate }
        : null,
    [departmentId, startDate, endDate],
  );

  const { data, isLoading, isError, error } = useTeamAttendanceQuery(
    listParams ?? {},
    Boolean(listParams),
  );
  const { data: employeesData } = useEmployeesQuery({
    locationId: locationId ?? "",
    departmentId: departmentId ?? undefined,
    page: 1,
    pageSize: 200,
  });
  const adjustMutation = useAdjustAttendanceMutation();

  const nameByEmployeeId = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of employeesData?.items ?? []) {
      map.set(e.id, `${e.firstName} ${e.lastName}`.trim());
    }
    return map;
  }, [employeesData?.items]);

  const departmentEmployeeIds = useMemo(
    () => new Set((employeesData?.items ?? []).map((e) => e.id)),
    [employeesData?.items],
  );

  const items = useMemo(() => {
    const raw = data?.items ?? [];
    if (!departmentId || departmentEmployeeIds.size === 0) return raw;
    return raw.filter((row) => departmentEmployeeIds.has(row.employeeId));
  }, [data?.items, departmentId, departmentEmployeeIds]);
  const listError = isError ? mapEmployeeError(error) : null;

  const openAdjust = (row: AttendanceResponse) => {
    setAdjustRow(row);
    setClockIn(toLocalInputValue(row.clockIn));
    setClockOut(row.clockOut ? toLocalInputValue(row.clockOut) : "");
    setAdjustmentNote("");
  };

  const closeAdjust = () => {
    setAdjustRow(null);
    setAdjustmentNote("");
  };

  const handleAdjust = async () => {
    if (!adjustRow || !adjustmentNote.trim() || !clockOut) return;
    await adjustMutation.mutateAsync({
      attendanceId: adjustRow.id,
      data: {
        clockIn: fromLocalInputValue(clockIn),
        clockOut: fromLocalInputValue(clockOut),
        adjustmentNote: adjustmentNote.trim(),
      },
    });
    closeAdjust();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Chi nhánh</span>
          <LocationSelect value={locationId} onChange={setLocationId} />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Phòng ban</span>
          <DepartmentSelect
            locationId={locationId}
            value={departmentId}
            onChange={setDepartmentId}
            allowEmpty={false}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tuần</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tuần trước"
              onClick={() => setWeekStartDate((w) => addWeeksISO(w, -1))}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="text-sm tabular-nums">
              {startDate} – {endDate}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tuần sau"
              onClick={() => setWeekStartDate((w) => addWeeksISO(w, 1))}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {!departmentId ? (
        <p className="text-sm text-muted-foreground">Chọn phòng ban để xem chấm công team.</p>
      ) : listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có bản ghi chấm công trong kỳ này.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Vào</TableHead>
                <TableHead>Ra</TableHead>
                <TableHead>Phút</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {nameByEmployeeId.get(row.employeeId) ?? row.employeeId.slice(0, 8)}
                    {row.adjustedBy ? (
                      <Badge variant="outline" className="ml-2">
                        Đã chỉnh
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{format(parseISO(row.clockIn), "dd/MM HH:mm")}</TableCell>
                  <TableCell>
                    {row.clockOut ? format(parseISO(row.clockOut), "dd/MM HH:mm") : "—"}
                  </TableCell>
                  <TableCell>{row.workedMinutes}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openAdjust(row)}>
                      Điều chỉnh
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={adjustRow !== null} onOpenChange={(open) => !open && closeAdjust()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh chấm công</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Clock in</FieldLabel>
              <Input
                type="datetime-local"
                value={clockIn}
                onChange={(e) => setClockIn(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Clock out</FieldLabel>
              <Input
                type="datetime-local"
                value={clockOut}
                onChange={(e) => setClockOut(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Ghi chú (bắt buộc)</FieldLabel>
              <Input
                value={adjustmentNote}
                onChange={(e) => setAdjustmentNote(e.target.value)}
                placeholder="Lý do chỉnh giờ…"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={closeAdjust}>
              Hủy
            </Button>
            <Button
              disabled={
                !adjustmentNote.trim() ||
                !clockOut ||
                adjustMutation.isPending
              }
              onClick={() => void handleAdjust()}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
