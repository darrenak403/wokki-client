import { StatCard, StatsGrid } from "@/components/shared/stats/stat-cards";
import { formatHours, formatVnd } from "@/lib/support/payroll/month";
import { PAY_PERIOD_STATUS, type PayrollSummaryResponse } from "@/types/payroll";

type PayrollSummaryTilesProps = {
  data: PayrollSummaryResponse;
};

export function PayrollSummaryTiles({ data }: PayrollSummaryTilesProps) {
  const isLocked = data.status === PAY_PERIOD_STATUS.Locked;
  const unpaidCount = data.lines.filter((line) => !line.isPaid).length;
  const totalOvertimeMinutes = data.lines.reduce(
    (sum, line) => sum + line.approvedOvertimeMinutes,
    0
  );

  return (
    <StatsGrid columns={4}>
      <StatCard label="Tổng chi phí lương (gồm OT)" value={formatVnd(data.totalGrossPay)} />
      <StatCard label="Trạng thái kỳ lương" value={isLocked ? "Đã chốt" : "Đang mở"} />
      <StatCard
        label="Chưa chuyển lương"
        value={unpaidCount}
        description={`/ ${data.lines.length} nhân viên`}
      />
      <StatCard label="Tổng giờ OT" value={formatHours(totalOvertimeMinutes)} />
      <StatCard label="Tổng số nhân viên" value={data.lines.length} />
    </StatsGrid>
  );
}
