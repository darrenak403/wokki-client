"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  LockIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyPayrollSummaryQuery } from "@/hooks/usePayroll";
import { mapPayrollError } from "@/lib/support/payroll/map-errors";
import { addMonthsISO, currentMonthISO, formatHours, formatVnd, monthBounds } from "@/lib/support/payroll/month";
import { PAY_PERIOD_STATUS } from "@/types/payroll";

export function MyPayrollPanel() {
  const params = useParams<{ orgId: string; locationId: string }>();
  const attendanceHref = `/${params.orgId}/${params.locationId}/user/attendance`;
  const [month, setMonth] = useState(() => currentMonthISO());
  const { startDate, endDate, label } = monthBounds(month);

  const { data, isLoading, isError, error } = useMyPayrollSummaryQuery(startDate, endDate);
  const listError = isError ? mapPayrollError(error) : null;
  const isLocked = data?.periodStatus === PAY_PERIOD_STATUS.Locked;

  const regularPay = data ? data.grossPay - data.overtimePay : 0;
  const regularRatio = data && data.grossPay > 0 ? regularPay / data.grossPay : 1;

  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Tháng trước"
          onClick={() => setMonth((m) => addMonthsISO(m, -1))}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="min-w-[7rem] text-center text-sm font-semibold tabular-nums">
          Tháng {label}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Tháng sau"
          onClick={() => setMonth((m) => addMonthsISO(m, 1))}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      {listError ? (
        <p className="text-sm text-destructive">{listError}</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : data ? (
        <>
          {/* Hero card */}
          <div className="overflow-hidden rounded-2xl bg-primary px-5 py-5 text-primary-foreground shadow-md">
            {/* Row 1: label + badge */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/60">
                Tổng lương tháng {label}
              </p>
              <Badge
                className={
                  isLocked
                    ? "shrink-0 border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                    : "shrink-0 border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground/75 hover:bg-primary-foreground/10"
                }
              >
                {isLocked ? <LockIcon className="mr-1 size-3" /> : <ClockIcon className="mr-1 size-3" />}
                {isLocked ? "Đã chốt" : "Ước tính"}
              </Badge>
            </div>

            {/* Row 2: big number */}
            <p className="mt-2 text-4xl font-bold tabular-nums leading-none">
              {formatVnd(data.grossPay)}
            </p>

            {/* Row 3: 3 stats */}
            <div className="mt-4 flex items-center gap-4 border-t border-primary-foreground/15 pt-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="size-4 shrink-0 text-primary-foreground/50" />
                <div>
                  <p className="text-sm font-semibold tabular-nums leading-tight">{formatHours(data.totalWorkedMinutes)}</p>
                  <p className="text-[10px] uppercase tracking-wide text-primary-foreground/55">Giờ làm</p>
                </div>
              </div>
              <div className="h-8 w-px bg-primary-foreground/15" />
              <div className="flex items-center gap-2">
                <ZapIcon className="size-4 shrink-0 text-primary-foreground/50" />
                <div>
                  <p className="text-sm font-semibold tabular-nums leading-tight">{formatHours(data.approvedOvertimeMinutes)}</p>
                  <p className="text-[10px] uppercase tracking-wide text-primary-foreground/55">Giờ OT</p>
                </div>
              </div>
              <div className="h-8 w-px bg-primary-foreground/15" />
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="size-4 shrink-0 text-primary-foreground/50" />
                <div>
                  <p className="text-sm font-semibold tabular-nums leading-tight">{formatVnd(data.hourlyRate)}/h</p>
                  <p className="text-[10px] uppercase tracking-wide text-primary-foreground/55">Mức lương</p>
                </div>
              </div>
            </div>

            {/* Row 4: breakdown bar */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
              <div
                className="h-full rounded-full bg-primary-foreground/80 transition-all"
                style={{ width: `${Math.round(regularRatio * 100)}%` }}
              />
            </div>
          </div>

          {/* Detail breakdown */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="px-4 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Chi tiết lương
              </p>
            </div>
            <div className="divide-y px-4 pb-1 pt-2">
              <div className="flex items-baseline justify-between gap-2 py-2.5 text-sm">
                <span className="text-muted-foreground">Lương ca thường</span>
                <span className="shrink-0 tabular-nums">{formatVnd(regularPay)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2 py-2.5 text-sm">
                <span className="text-muted-foreground">Lương OT</span>
                <span className="shrink-0 tabular-nums">{formatVnd(data.overtimePay)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2 py-3 text-sm font-semibold">
                <span>Tổng lương</span>
                <span className="shrink-0 tabular-nums text-primary">{formatVnd(data.grossPay)}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={attendanceHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ExternalLinkIcon className="size-4" />
            Xem chi tiết chấm công
          </Link>
        </>
      ) : null}
    </div>
  );
}
