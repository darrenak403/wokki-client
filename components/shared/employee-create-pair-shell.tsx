"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  EMPLOYEE_CREATE_PAIR_HEIGHT_CLASS,
  EMPLOYEE_CREATE_PAIR_MAX_WIDTH_CLASS,
} from "@/components/shared/employee-create-dialog-pair-layout";
import { cn } from "@/lib/utils";

type EmployeeCreatePairShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

/** Centers workspace + employee panels as one flex row — independent of Dialog positioning. */
export function EmployeeCreatePairShell({
  open,
  onOpenChange,
  children,
}: EmployeeCreatePairShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Đóng"
        className="fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="presentation"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className={cn(
            "pointer-events-auto flex w-full items-stretch gap-4",
            EMPLOYEE_CREATE_PAIR_MAX_WIDTH_CLASS,
            EMPLOYEE_CREATE_PAIR_HEIGHT_CLASS
          )}
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}
