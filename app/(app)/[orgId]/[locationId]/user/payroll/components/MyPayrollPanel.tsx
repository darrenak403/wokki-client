"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PayslipSections } from "@/components/payroll/PayslipSections";
import { useMyPayrollSummaryQuery } from "@/hooks/usePayroll";
import { mapPayrollError } from "@/lib/support/payroll/map-errors";
import { addMonthsISO, currentMonthISO, monthBounds } from "@/lib/support/payroll/month";
import { PAY_PERIOD_STATUS } from "@/types/payroll";

export function MyPayrollPanel() {
  const params = useParams<{ orgId: string; locationId: string }>();
  const attendanceHref = `/${params.orgId}/${params.locationId}/user/attendance`;
  const [month, setMonth] = useState(() => currentMonthISO());
  const { startDate, endDate, label } = monthBounds(month);

  const { data, isLoading, isError, error } = useMyPayrollSummaryQuery(startDate, endDate);
  const listError = isError ? mapPayrollError(error) : null;
  const isLocked = data?.periodStatus === PAY_PERIOD_STATUS.Locked;

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="border-b pb-4">
        <Label className="text-xs font-normal text-muted-foreground">Lương tháng</Label>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Tháng trước"
            onClick={() => setMonth((m) => addMonthsISO(m, -1))}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="min-w-[5rem] text-center text-sm tabular-nums">{label}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Tháng sau"
            onClick={() => setMonth((m) => addMonthsISO(m, 1))}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      {listError ? (
        <p className="text-sm text-destructive">{listError}</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : data ? (
        <PayslipSections
          variant="self"
          periodLabel={label}
          isLocked={isLocked}
          hours={{
            totalWorkedMinutes: data.totalWorkedMinutes,
            regularMinutes: data.regularMinutes,
            approvedOvertimeMinutes: data.approvedOvertimeMinutes,
          }}
          pay={{
            hourlyRate: data.hourlyRate,
            overtimePay: data.overtimePay,
            grossPay: data.grossPay,
          }}
        />
      ) : null}

      <Link href={attendanceHref} className="text-sm text-primary underline-offset-4 hover:underline">
        Xem chi tiết chấm công →
      </Link>
    </div>
  );
}
