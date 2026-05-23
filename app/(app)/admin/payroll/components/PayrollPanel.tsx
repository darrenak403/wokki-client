"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DepartmentSelect } from "@/components/shared/department-select";
import { LocationSelect } from "@/components/shared/location-select";
import { useExportPayrollCsvMutation, usePayrollSummaryQuery } from "@/hooks/usePayroll";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { mapPayrollError } from "@/lib/support/payroll/map-errors";
import { addWeeksISO, toMondayISO, weekRangeFromMonday } from "@/lib/support/schedule/week";
import { PAY_PERIOD_STATUS } from "@/types/payroll";

type PayrollPanelProps = {
  canExportCsv: boolean;
};

export function PayrollPanel({ canExportCsv }: PayrollPanelProps) {
  const { session, setLocationId, setDepartmentId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;
  const [weekStartDate, setWeekStartDate] = useState(() => toMondayISO(new Date()));

  const { startDate, endDate } = weekRangeFromMonday(weekStartDate);

  const summaryParams = useMemo(
    () => (departmentId ? { departmentId, startDate, endDate } : null),
    [departmentId, startDate, endDate]
  );

  const { data, isLoading, isError, error } = usePayrollSummaryQuery(summaryParams);
  const exportMutation = useExportPayrollCsvMutation();

  const listError = isError ? mapPayrollError(error) : null;
  const isLocked = data?.status === PAY_PERIOD_STATUS.Locked;

  const handleExport = () => {
    if (!summaryParams || !canExportCsv) return;
    void exportMutation.mutateAsync({
      departmentId: summaryParams.departmentId,
      startDate: summaryParams.startDate,
      endDate: summaryParams.endDate,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Chi nhánh</span>
          <LocationSelect value={locationId} onChange={setLocationId} />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Phòng ban</span>
          <DepartmentSelect
            locationId={locationId}
            value={departmentId}
            onChange={setDepartmentId}
            allowEmpty={false}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Kỳ lương (tuần)</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tuần trước"
              onClick={() => setWeekStartDate((w) => addWeeksISO(w, -1))}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="text-sm tabular-nums">
              {startDate} – {endDate}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tuần sau"
              onClick={() => setWeekStartDate((w) => addWeeksISO(w, 1))}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
        {canExportCsv && summaryParams ? (
          <Button disabled={exportMutation.isPending || isLoading} onClick={handleExport}>
            {exportMutation.isPending ? "Đang xuất…" : "Export CSV"}
          </Button>
        ) : null}
      </div>

      {data && isLocked ? <Badge variant="secondary">Kỳ lương đã khóa — chỉ đọc</Badge> : null}

      <p className="text-xs text-muted-foreground">
        grossPay ≈ (phút làm / 60) × lương giờ — chỉ bản ghi đã clock-out (BR-055).
      </p>

      {!departmentId ? (
        <p className="text-sm text-muted-foreground">Chọn phòng ban để xem lương.</p>
      ) : listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : !data || data.lines.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có dữ liệu lương trong kỳ — cần nhân viên clock-out trước.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Phút</TableHead>
                  <TableHead>Lương/giờ</TableHead>
                  <TableHead>Lương gross</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lines.map((line) => (
                  <TableRow key={line.employeeId}>
                    <TableCell>
                      {line.firstName} {line.lastName}
                    </TableCell>
                    <TableCell>{line.totalWorkedMinutes}</TableCell>
                    <TableCell>{line.hourlyRate}</TableCell>
                    <TableCell>{line.grossPay}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm font-medium">Tổng gross: {data.totalGrossPay}</p>
        </div>
      )}
    </div>
  );
}
