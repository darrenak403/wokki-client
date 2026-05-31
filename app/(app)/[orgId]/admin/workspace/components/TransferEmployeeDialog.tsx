"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmployeeTransferPanel,
  employeeDisplayName,
} from "@/app/(app)/[orgId]/admin/workspace/components/EmployeeTransferPanel";
import type { EmployeeResponse } from "@/types/foundation";

type TransferEmployeeDialogProps = {
  employee: EmployeeResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransferred?: () => void;
};

export function TransferEmployeeDialog({
  employee,
  open,
  onOpenChange,
  onTransferred,
}: TransferEmployeeDialogProps) {
  const close = () => onOpenChange(false);

  const handleTransferred = () => {
    onTransferred?.();
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Điều chuyển nhân viên</DialogTitle>
          <DialogDescription>
            Chọn chi nhánh và phòng ban mới cho {employeeDisplayName(employee)}.
          </DialogDescription>
        </DialogHeader>

        <EmployeeTransferPanel
          key={employee.id}
          employee={employee}
          onTransferred={handleTransferred}
          onCancel={close}
          showCancel
        />
      </DialogContent>
    </Dialog>
  );
}
