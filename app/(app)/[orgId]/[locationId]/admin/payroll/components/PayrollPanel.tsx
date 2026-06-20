"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { PayrollEmployeeDetailDialog } from "@/app/(app)/[orgId]/[locationId]/admin/payroll/components/PayrollEmployeeDetailDialog";
import { PayrollLockPeriodDialog } from "@/app/(app)/[orgId]/[locationId]/admin/payroll/components/PayrollLockPeriodDialog";
import { PayrollPayoutDialog } from "@/app/(app)/[orgId]/[locationId]/admin/payroll/components/PayrollPayoutDialog";
import { PayrollSummaryTiles } from "@/app/(app)/[orgId]/[locationId]/admin/payroll/components/PayrollSummaryTiles";
import {
  useExportPayrollCsvMutation,
  useLockPayrollPeriodMutation,
  usePayrollSummaryQuery,
  useSetPayrollLinePaidMutation,
} from "@/hooks/usePayroll";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { DepartmentScopeChips } from "@/components/shared/department-scope-chips";
import { mapPayrollError } from "@/lib/support/payroll/map-errors";
import { addMonthsISO, currentMonthISO, formatVnd, monthBounds } from "@/lib/support/payroll/month";
import { PAY_PERIOD_STATUS, type PayrollLineResponse } from "@/types/payroll";

type PayrollPanelProps = {
  canExportCsv: boolean;
  canLock?: boolean;
  canMarkPaid?: boolean;
};

export function PayrollPanel({
  canExportCsv,
  canLock = false,
  canMarkPaid = false,
}: PayrollPanelProps) {
  const { session, setDepartmentId } = useFoundationSession();
  const departmentId = session.selectedDepartmentId;
  const locationId = session.selectedLocationId;
  const [month, setMonth] = useState(() => currentMonthISO());
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [payoutLine, setPayoutLine] = useState<PayrollLineResponse | null>(null);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [detailEmployeeId, setDetailEmployeeId] = useState<string | null>(null);

  const { startDate, endDate, label } = monthBounds(month);

  const summaryParams = useMemo(
    () =>
      departmentId
        ? { departmentId, startDate, endDate, unpaidOnly: unpaidOnly || undefined }
        : null,
    [departmentId, startDate, endDate, unpaidOnly]
  );

  const { data, isLoading, isError, error } = usePayrollSummaryQuery(summaryParams);
  const exportMutation = useExportPayrollCsvMutation();
  const lockMutation = useLockPayrollPeriodMutation();
  const paidMutation = useSetPayrollLinePaidMutation();

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

  const handleLockConfirm = () => {
    if (!data?.payPeriodId || !canLock) return;
    void lockMutation.mutateAsync(data.payPeriodId).then(() => setLockDialogOpen(false));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 border-b pb-4">
        <DepartmentScopeChips
          locationId={locationId}
          value={departmentId}
          onChange={setDepartmentId}
          allowAll={false}
          maxVisible={5}
        />

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-normal text-muted-foreground">Kỳ lương (tháng)</Label>
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

          <div className="flex flex-wrap gap-2">
            {canLock && data && !isLocked ? (
              <Button
                disabled={lockMutation.isPending || isLoading}
                onClick={() => setLockDialogOpen(true)}
              >
                Chốt kỳ
              </Button>
            ) : null}
            {canExportCsv && summaryParams ? (
              <Button
                variant="outline"
                disabled={exportMutation.isPending || isLoading}
                onClick={handleExport}
              >
                {exportMutation.isPending ? "Đang xuất…" : "Export CSV"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {isLocked ? (
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">Đã chốt — snapshot không đổi</Badge>
          {canMarkPaid ? (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={unpaidOnly} onCheckedChange={(c) => setUnpaidOnly(c === true)} />
              Chỉ hiện chưa chuyển lương
            </label>
          ) : null}
        </div>
      ) : (
        <></>
      )}

      {!departmentId ? (
        <p className="text-sm text-muted-foreground">Chọn phòng ban để xem lương.</p>
      ) : listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : !data || data.lines.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có dữ liệu lương trong tháng này.</p>
      ) : (
        <div className="space-y-4">
          <PayrollSummaryTiles data={data} />
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Giờ</TableHead>
                  <TableHead>VND/giờ</TableHead>
                  <TableHead>Gross</TableHead>
                  {isLocked && canMarkPaid ? <TableHead>CK</TableHead> : null}
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lines.map((line) => (
                  <TableRow key={line.employeeId}>
                    <TableCell>
                      {line.firstName} {line.lastName}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {Math.round(line.totalWorkedMinutes / 60)}h
                      {line.approvedOvertimeMinutes > 0
                        ? ` (+OT ${line.approvedOvertimeMinutes}p)`
                        : ""}
                    </TableCell>
                    <TableCell className="tabular-nums">{formatVnd(line.hourlyRate)}</TableCell>
                    <TableCell className="tabular-nums font-medium">
                      {formatVnd(line.grossPay)}
                    </TableCell>
                    {isLocked && canMarkPaid ? (
                      <TableCell>
                        <Checkbox
                          checked={line.isPaid}
                          onCheckedChange={(checked) =>
                            void paidMutation.mutateAsync({
                              payPeriodId: data.payPeriodId,
                              employeeId: line.employeeId,
                              paid: checked === true,
                            })
                          }
                          disabled={paidMutation.isPending}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailEmployeeId(line.employeeId)}
                        >
                          <EyeIcon className="mr-1 size-3.5" />
                          Xem chi tiết
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPayoutLine(line)}
                        >
                          Chuyển lương
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm font-medium">Tổng phòng ban: {formatVnd(data.totalGrossPay)}</p>
        </div>
      )}

      <PayrollPayoutDialog
        line={payoutLine}
        open={payoutLine !== null}
        onOpenChange={(open) => {
          if (!open) setPayoutLine(null);
        }}
      />

      <PayrollEmployeeDetailDialog
        employeeId={detailEmployeeId}
        params={summaryParams}
        periodLabel={label}
        isLocked={isLocked}
        open={detailEmployeeId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailEmployeeId(null);
        }}
      />

      <PayrollLockPeriodDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        monthLabel={label}
        employeeCount={data?.lines.length ?? 0}
        totalGross={data?.totalGrossPay ?? 0}
        isPending={lockMutation.isPending}
        onConfirm={handleLockConfirm}
      />
    </div>
  );
}
