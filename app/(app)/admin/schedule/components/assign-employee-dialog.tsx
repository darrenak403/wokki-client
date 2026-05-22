"use client";

import { useState } from "react";
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
import { useCreateAssignmentMutation } from "@/hooks/useSchedule";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { format } from "date-fns";
import { parseISO } from "date-fns";

type AssignEmployeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string;
  listParams: { departmentId: string; weekStartDate: string };
  shiftDefinitionId: string;
  shiftName: string;
  date: string;
};

export function AssignEmployeeDialog({
  open,
  onOpenChange,
  scheduleId,
  listParams,
  shiftDefinitionId,
  shiftName,
  date,
}: AssignEmployeeDialogProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [note, setNote] = useState("");
  const createMutation = useCreateAssignmentMutation(scheduleId, listParams);
  const { data: employeesPage, isLoading } = useEmployeesQuery({
    departmentId: listParams.departmentId,
    pageSize: 100,
  });
  const employees = (employeesPage?.items ?? []).filter((e) => !e.terminatedAt);

  const dateLabel = format(parseISO(date), "dd/MM/yyyy");

  const handleSubmit = async () => {
    if (!employeeId) return;
    await createMutation.mutateAsync({
      shiftDefinitionId,
      employeeId,
      date,
      note: note.trim() || null,
    });
    setEmployeeId("");
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phân ca — {shiftName}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Ngày {dateLabel}</p>
        <FieldGroup>
          <Field>
            <FieldLabel>Nhân viên</FieldLabel>
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={employeeId}
              disabled={isLoading || createMutation.isPending}
              onChange={(e) => setEmployeeId(e.target.value)}
              aria-label="Chọn nhân viên"
            >
              <option value="">{isLoading ? "Đang tải…" : "Chọn nhân viên"}</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} — {emp.position}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel>Ghi chú (tuỳ chọn)</FieldLabel>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pha chế bar…" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button disabled={!employeeId || createMutation.isPending} onClick={() => void handleSubmit()}>
            {createMutation.isPending ? "Đang lưu…" : "Phân ca"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
