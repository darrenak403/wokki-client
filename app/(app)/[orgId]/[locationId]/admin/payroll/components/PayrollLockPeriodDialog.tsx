"use client";

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
import { formatVnd } from "@/lib/support/payroll/month";

type PayrollLockPeriodDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthLabel: string;
  employeeCount: number;
  totalGross: number;
  isPending: boolean;
  onConfirm: () => void;
};

export function PayrollLockPeriodDialog({
  open,
  onOpenChange,
  monthLabel,
  employeeCount,
  totalGross,
  isPending,
  onConfirm,
}: PayrollLockPeriodDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Chốt kỳ lương {monthLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            Sau khi chốt, số liệu lương tháng này được cố định (snapshot). Admin không thể chỉnh
            chấm công trong kỳ đã chốt; có thể dùng bảng lương để chuyển khoản.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>{employeeCount} nhân viên trong bảng</li>
          <li>Tổng gross: {formatVnd(totalGross)}</li>
        </ul>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Huỷ</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={onConfirm}>
            {isPending ? "Đang chốt…" : "Chốt kỳ"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
