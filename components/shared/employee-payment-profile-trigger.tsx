"use client";

import { useState } from "react";
import { LandmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeePaymentProfileDialog } from "@/components/shared/employee-payment-profile-dialog";
import {
  formatPaymentProfileSummary,
  hasEmployeePaymentProfile,
  type EmployeePaymentProfileFields,
} from "@/lib/support/employee/payment-profile";
import { cn } from "@/lib/utils";

type EmployeePaymentProfileTriggerProps = {
  employeeName: string;
  profile: EmployeePaymentProfileFields;
  variant?: "button" | "cell";
  className?: string;
};

export function EmployeePaymentProfileTrigger({
  employeeName,
  profile,
  variant = "cell",
  className,
}: EmployeePaymentProfileTriggerProps) {
  const [open, setOpen] = useState(false);
  const configured = hasEmployeePaymentProfile(profile);
  const summary = formatPaymentProfileSummary(profile);

  return (
    <>
      {variant === "button" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-8 gap-1.5", className)}
          onClick={() => setOpen(true)}
        >
          <LandmarkIcon className="size-3.5" aria-hidden="true" />
          {configured ? "Xem STK" : "Chưa có STK"}
        </Button>
      ) : (
        <button
          type="button"
          className={cn(
            "inline-flex max-w-[180px] items-center gap-1.5 rounded-lg px-2 py-1 text-left text-sm transition-colors hover:bg-muted/70",
            configured ? "text-foreground" : "text-muted-foreground",
            className
          )}
          onClick={() => setOpen(true)}
        >
          <LandmarkIcon className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
          <span className="truncate">{summary}</span>
        </button>
      )}

      <EmployeePaymentProfileDialog
        open={open}
        onOpenChange={setOpen}
        employeeName={employeeName}
        profile={profile}
      />
    </>
  );
}
