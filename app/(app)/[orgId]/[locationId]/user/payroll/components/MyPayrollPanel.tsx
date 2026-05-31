"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMyPayrollSummaryQuery } from "@/hooks/usePayroll";
import { mapPayrollError } from "@/lib/support/payroll/map-errors";
import {
  addMonthsISO,
  currentMonthISO,
  formatVnd,
  monthBounds,
} from "@/lib/support/payroll/month";
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
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-end justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <Label className="text-xs font-normal text-muted-foreground">Lương tháng</Label>
          <div className="flex items-center gap-1">
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
        {isLocked ? <Badge variant="secondary">Đã chốt</Badge> : <Badge variant="outline">Ước tính</Badge>}
      </div>

      {listError ? (
        <p className="text-sm text-destructive">{listError}</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : data ? (
        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng giờ làm</span>
              <span className="tabular-nums font-medium">
                {Math.floor(data.totalWorkedMinutes / 60)}h {data.totalWorkedMinutes % 60}p
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giờ ca thường</span>
              <span className="tabular-nums">{Math.round(data.regularMinutes / 60)}h</span>
            </div>
            {data.approvedOvertimeMinutes > 0 ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">OT đã duyệt</span>
                <span className="tabular-nums">{data.approvedOvertimeMinutes} phút</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mức lương</span>
              <span className="tabular-nums">{formatVnd(data.hourlyRate)}/giờ</span>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-xs uppercase text-muted-foreground">Tổng lương</p>
            <p className="text-3xl font-semibold tabular-nums">{formatVnd(data.grossPay)}</p>
          </div>
        </div>
      ) : null}

      <Link href={attendanceHref} className="text-sm text-primary underline-offset-4 hover:underline">
        Xem chi tiết chấm công →
      </Link>
    </div>
  );
}
