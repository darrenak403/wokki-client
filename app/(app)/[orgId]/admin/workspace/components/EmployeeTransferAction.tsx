"use client";

import { useState } from "react";
import { ArrowRightLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmployeeResponse } from "@/types/foundation";
import { TransferEmployeeDialog } from "./TransferEmployeeDialog";

type EmployeeTransferActionProps = {
  employee: EmployeeResponse;
  disabled?: boolean;
};

export function EmployeeTransferAction({
  employee,
  disabled = false,
}: EmployeeTransferActionProps) {
  const [open, setOpen] = useState(false);
  const isTerminated = Boolean(employee.terminatedAt);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled || isTerminated}
        onClick={() => setOpen(true)}
      >
        <ArrowRightLeftIcon data-icon="inline-start" aria-hidden="true" />
        Điều chuyển
      </Button>
      {open ? (
        <TransferEmployeeDialog employee={employee} open={open} onOpenChange={setOpen} />
      ) : null}
    </>
  );
}
