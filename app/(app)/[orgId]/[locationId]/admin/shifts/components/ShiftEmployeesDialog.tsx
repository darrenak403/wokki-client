"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatEmployeeName,
  getShiftEligibleEmployees,
} from "@/lib/support/shift/shift-eligible-employees";
import type { EmployeeResponse, ShiftDefinitionResponse } from "@/types/foundation";

type ShiftEmployeesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: ShiftDefinitionResponse | null;
  employees: EmployeeResponse[];
};

function toTimeLabel(value: string): string {
  return value?.slice(0, 5) ?? "";
}

export function ShiftEmployeesDialog({
  open,
  onOpenChange,
  shift,
  employees,
}: ShiftEmployeesDialogProps) {
  const eligible = shift ? getShiftEligibleEmployees(shift, employees) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{shift ? shift.name : "Nhân viên ca"}</DialogTitle>
          {shift ? (
            <DialogDescription>
              {toTimeLabel(shift.startTime)} – {toTimeLabel(shift.endTime)} · {eligible.length}{" "}
              nhân viên có thể xếp ca này
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {eligible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Chưa có nhân viên phù hợp trong phòng ban này.
          </p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {eligible.map((employee) => (
              <li
                key={employee.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{formatEmployeeName(employee)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {employee.position?.trim() || employee.email}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{employee.role}</span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
