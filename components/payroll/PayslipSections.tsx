import { ClockIcon, LockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours, formatVnd } from "@/lib/support/payroll/month";
import type { PayrollAttendanceItem } from "@/types/payroll";

type PayslipHours = {
  totalWorkedMinutes: number;
  regularMinutes: number;
  approvedOvertimeMinutes: number;
};

type PayslipPay = {
  hourlyRate: number;
  overtimePay: number;
  grossPay: number;
};

type PayslipSectionsProps =
  | {
      variant: "self";
      periodLabel: string;
      isLocked: boolean;
      hours: PayslipHours;
      pay: PayslipPay;
    }
  | {
      variant: "admin";
      periodLabel: string;
      isLocked: boolean;
      hours: PayslipHours;
      pay: PayslipPay;
      isPaid: boolean;
      bank: {
        accountNumber?: string | null;
        accountHolderName?: string | null;
        bankName?: string | null;
      };
      attendanceItems: PayrollAttendanceItem[];
    };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function PeriodStatusBadge({ isLocked }: { isLocked: boolean }) {
  return isLocked ? (
    <Badge variant="secondary" className="gap-1">
      <LockIcon className="size-3" /> Đã chốt
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1">
      <ClockIcon className="size-3" /> Ước tính
    </Badge>
  );
}

export function PayslipSections(props: PayslipSectionsProps) {
  const { periodLabel, isLocked, hours, pay } = props;
  const regularPay = pay.grossPay - pay.overtimePay;
  const noHoursYet = !isLocked && hours.totalWorkedMinutes === 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium">Kỳ lương</CardTitle>
          <PeriodStatusBadge isLocked={isLocked} />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{periodLabel}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Giờ làm</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <Row label="Tổng giờ làm" value={formatHours(hours.totalWorkedMinutes)} />
          <Row label="Giờ ca thường" value={formatHours(hours.regularMinutes)} />
          <Row label="Giờ OT đã duyệt" value={formatHours(hours.approvedOvertimeMinutes)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Lương</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <Row label="Mức lương" value={`${formatVnd(pay.hourlyRate)}/giờ`} />
          <Row label="Lương ca thường" value={formatVnd(regularPay)} />
          <Row label="Lương OT" value={formatVnd(pay.overtimePay)} />
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Tổng lương (gross)</span>
            <span className="tabular-nums">{formatVnd(pay.grossPay)}</span>
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {isLocked ? (
              <>
                <LockIcon className="size-3" /> Số liệu cuối cùng — kỳ lương đã chốt, không thay đổi
              </>
            ) : (
              <>
                <ClockIcon className="size-3" /> Số liệu ước tính — có thể thay đổi đến khi kỳ lương được
                chốt
              </>
            )}
          </p>
          {noHoursYet ? (
            <p className="text-xs text-muted-foreground">
              Chưa có giờ làm nào được ghi nhận trong kỳ này.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {props.variant === "admin" ? (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <Row label="Trạng thái" value={props.isPaid ? "Đã chuyển" : "Chưa chuyển"} />
              {props.bank.bankName ? <Row label="Ngân hàng" value={props.bank.bankName} /> : null}
              {props.bank.accountHolderName ? (
                <Row label="Chủ TK" value={props.bank.accountHolderName} />
              ) : null}
              {props.bank.accountNumber ? (
                <Row label="STK" value={props.bank.accountNumber} />
              ) : null}
              {!props.bank.bankName && !props.bank.accountNumber ? (
                <p className="text-muted-foreground">Nhân viên chưa cập nhật thông tin nhận lương.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Chi tiết chấm công</CardTitle>
            </CardHeader>
            <CardContent>
              {props.attendanceItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không có dữ liệu chấm công.</p>
              ) : (
                <div className="space-y-1 text-sm">
                  {props.attendanceItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {new Date(item.clockIn).toLocaleString("vi-VN")}
                      </span>
                      <span className="tabular-nums">
                        {item.clockOut ? formatHours(item.workedMinutes) : "Đang làm"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
