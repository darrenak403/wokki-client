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
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
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

function PeriodCard({ periodLabel, isLocked }: { periodLabel: string; isLocked: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium">Kỳ lương</CardTitle>
        <PeriodStatusBadge isLocked={isLocked} />
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{periodLabel}</CardContent>
    </Card>
  );
}

function HoursCard({ hours }: { hours: PayslipHours }) {
  return (
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
  );
}

function PayCard({ pay }: { pay: PayslipPay }) {
  const regularPay = pay.grossPay - pay.overtimePay;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Lương</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <Row label="Mức lương" value={`${formatVnd(pay.hourlyRate)}/giờ`} />
        <Row label="Lương ca thường" value={formatVnd(regularPay)} />
        <Row label="Lương OT" value={formatVnd(pay.overtimePay)} />
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t pt-4 font-semibold">
          <span>Tổng lương</span>
          <span className="shrink-0 tabular-nums">{formatVnd(pay.grossPay)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentCard({
  isPaid,
  bank,
}: {
  isPaid: boolean;
  bank: {
    accountNumber?: string | null;
    accountHolderName?: string | null;
    bankName?: string | null;
  };
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Thanh toán</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <Row label="Trạng thái" value={isPaid ? "Đã chuyển" : "Chưa chuyển"} />
        {bank.bankName ? <Row label="Ngân hàng" value={bank.bankName} /> : null}
        {bank.accountHolderName ? <Row label="Chủ TK" value={bank.accountHolderName} /> : null}
        {bank.accountNumber ? <Row label="STK" value={bank.accountNumber} /> : null}
        {!bank.bankName && !bank.accountNumber ? (
          <p className="text-muted-foreground">Nhân viên chưa cập nhật thông tin nhận lương.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AttendanceCard({ attendanceItems }: { attendanceItems: PayrollAttendanceItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Chi tiết chấm công</CardTitle>
      </CardHeader>
      <CardContent>
        {attendanceItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có dữ liệu chấm công.</p>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto text-sm">
            {attendanceItems.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-muted-foreground">
                  {new Date(item.clockIn).toLocaleString("vi-VN")}
                </span>
                <span className="shrink-0 tabular-nums">
                  {item.clockOut ? formatHours(item.workedMinutes) : "Đang làm"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PayslipSections(props: PayslipSectionsProps) {
  const { periodLabel, isLocked, hours, pay } = props;

  if (props.variant === "admin") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <PeriodCard periodLabel={periodLabel} isLocked={isLocked} />
          <PaymentCard isPaid={props.isPaid} bank={props.bank} />
          <AttendanceCard attendanceItems={props.attendanceItems} />
        </div>
        <div className="space-y-4">
          <HoursCard hours={hours} />
          <PayCard pay={pay} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PeriodCard periodLabel={periodLabel} isLocked={isLocked} />
      <HoursCard hours={hours} />
      <PayCard pay={pay} />
    </div>
  );
}
