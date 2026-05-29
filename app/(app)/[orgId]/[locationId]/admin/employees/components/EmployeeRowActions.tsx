"use client";

import { useState } from "react";
import {
  ArrowRightLeftIcon,
  MoreHorizontalIcon,
  PencilIcon,
  UserXIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransferEmployeeDialog } from "@/app/(app)/[orgId]/admin/workspace/components/TransferEmployeeDialog";
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";
import type { EmployeeResponse } from "@/types/foundation";

type EmployeeRowActionsProps = {
  employee: EmployeeResponse;
  canWrite?: boolean;
  canTransfer?: boolean;
  onEdit: (employee: EmployeeResponse) => void;
  onTerminate: (employee: EmployeeResponse) => void;
};

export function EmployeeRowActions({
  employee,
  canWrite = false,
  canTransfer = false,
  onEdit,
  onTerminate,
}: EmployeeRowActionsProps) {
  const [transferOpen, setTransferOpen] = useState(false);
  const isTerminated = Boolean(employee.terminatedAt);

  const showEdit = canWrite && !isTerminated;
  const showTransfer = canTransfer && !isTerminated;
  const showTerminate = canWrite && !isTerminated;

  if (!showEdit && !showTransfer && !showTerminate) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 text-muted-foreground"
              aria-label={`Thao tác — ${employee.lastName} ${employee.firstName}`}
            />
          }
        >
          <MoreHorizontalIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {showEdit ? (
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <PencilIcon aria-hidden="true" />
              Sửa hồ sơ
            </DropdownMenuItem>
          ) : null}
          {showTransfer ? (
            <DropdownMenuItem onClick={() => setTransferOpen(true)}>
              <ArrowRightLeftIcon aria-hidden="true" />
              Điều chuyển
            </DropdownMenuItem>
          ) : null}
          {showTerminate ? (
            <>
              {showEdit || showTransfer ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onTerminate(employee)}
              >
                <UserXIcon aria-hidden="true" />
                Chấm dứt
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {showTransfer && transferOpen ? (
        <TransferEmployeeDialog
          employee={employee}
          open={transferOpen}
          onOpenChange={setTransferOpen}
        />
      ) : null}
    </>
  );
}

export function employeeRoleLabel(role: string): string {
  switch (role) {
    case ROLE_ADMIN:
      return "Admin";
    case ROLE_MANAGER:
      return "Quản lý";
    case ROLE_USER:
      return "Nhân viên";
    default:
      return role;
  }
}
