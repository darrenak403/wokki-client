"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PayslipSections } from "@/components/payroll/PayslipSections";
import { usePayrollEmployeeDetailQuery } from "@/hooks/usePayroll";
import { mapPayrollError } from "@/lib/support/payroll/map-errors";
import type { PayrollSummaryParams } from "@/types/payroll";

type PayrollEmployeeDetailDialogProps = {
  employeeId: string | null;
  params: PayrollSummaryParams | null;
  periodLabel: string;
  isLocked: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PayrollEmployeeDetailDialog({
  employeeId,
  params,
  periodLabel,
  isLocked,
  open,
  onOpenChange,
}: PayrollEmployeeDetailDialogProps) {
  const { data, isLoading, isError, error } = usePayrollEmployeeDetailQuery(
    employeeId,
    params,
    open && Boolean(employeeId)
  );
  const detailError = isError ? mapPayrollError(error) : null;
  const employeeName = data ? `${data.lastName} ${data.firstName}`.trim() : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Phiếu lương{employeeName ? ` — ${employeeName}` : ""}</DialogTitle>
        </DialogHeader>

        {detailError ? (
          <p className="text-sm text-destructive" role="alert">
            {detailError}
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : data ? (
          <PayslipSections
            variant="admin"
            periodLabel={periodLabel}
            isLocked={isLocked}
            hours={{
              totalWorkedMinutes: data.totalWorkedMinutes,
              regularMinutes: data.totalWorkedMinutes - data.approvedOvertimeMinutes,
              approvedOvertimeMinutes: data.approvedOvertimeMinutes,
            }}
            pay={{
              hourlyRate: data.hourlyRate,
              overtimePay: data.overtimePay,
              grossPay: data.grossPay,
            }}
            isPaid={data.isPaid}
            bank={{
              accountNumber: data.bankAccountNumber,
              accountHolderName: data.bankAccountHolderName,
              bankName: data.bankName,
            }}
            attendanceItems={data.attendanceItems}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
