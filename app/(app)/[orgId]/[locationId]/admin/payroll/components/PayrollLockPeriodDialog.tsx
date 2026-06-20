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
            Hành động này chốt số liệu lương tháng {monthLabel} thành bản cố định (snapshot).
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-foreground">Sẽ chốt số liệu của</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
              <li>{employeeCount} nhân viên trong bảng</li>
              <li>Tổng gross: {formatVnd(totalGross)}</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-foreground">Sau khi chốt, không thể thay đổi</p>
            <p className="mt-1 text-muted-foreground">
              Admin không thể chỉnh sửa chấm công hoặc số liệu lương trong kỳ đã chốt.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">Nhân viên sẽ thấy</p>
            <p className="mt-1 text-muted-foreground">
              Phiếu lương hiển thị là số liệu cuối cùng (không còn là ước tính); bảng lương có thể
              dùng để chuyển khoản.
            </p>
          </div>
        </div>

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
