"use client";

import { useMemo, useState } from "react";
import { useOrgStatsQuery, useOrgUsageAnalyticsQuery } from "@/hooks/useOrgStats";
import { StatCard, StatsGrid } from "@/components/shared/stats/stat-cards";
import { PendingJoinRequestsWidget } from "@/components/shared/org-join/pending-join-requests-widget";
import {
  ActivityTrendChart,
  type ActivityChartDatum,
  type ActivitySeries,
} from "@/components/shared/dashboard/activity-trend-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UsageWindow = "7" | "30";

const ACTIVITY_SERIES: ActivitySeries[] = [
  { key: "attendance.clock_in", label: "Vào ca", color: "#16a34a", emphasize: true },
  { key: "attendance.clock_out", label: "Ra ca", color: "#f97316", emphasize: true },
  { key: "auth.login", label: "Đăng nhập", color: "#3b82f6" },
  { key: "schedule.publish", label: "Công bố lịch", color: "#a855f7" },
  { key: "schedule.suggest", label: "Gợi ý lịch", color: "#6366f1" },
  { key: "schedule.apply_suggestions", label: "Áp dụng gợi ý", color: "#ec4899" },
  { key: "chat.message", label: "Tin nhắn", color: "#9ca3af" },
];

export function AdminDashboardPanel() {
  const { data: stats, isLoading, isError } = useOrgStatsQuery();

  const [windowDays, setWindowDays] = useState<UsageWindow>("7");
  const usageQuery = useOrgUsageAnalyticsQuery({
    windowDays: Number.parseInt(windowDays, 10) as 7 | 30,
  });

  const chartData: ActivityChartDatum[] = useMemo(() => {
    const dailyCounts = usageQuery.data?.dailyCounts ?? [];
    const byDate = new Map<string, ActivityChartDatum>();
    for (const item of dailyCounts) {
      const row = byDate.get(item.date) ?? { date: item.date };
      row[item.eventType] = (Number(row[item.eventType]) || 0) + item.count;
      byDate.set(item.date, row);
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [usageQuery.data?.dailyCounts]);

  const activeSeries = useMemo(() => {
    const presentKeys = new Set(usageQuery.data?.countsByEventType.map((c) => c.eventType) ?? []);
    return ACTIVITY_SERIES.filter((s) => presentKeys.has(s.key));
  }, [usageQuery.data?.countsByEventType]);

  return (
    <div className="space-y-6">
      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>Không tải được thống kê tổ chức.</AlertDescription>
        </Alert>
      ) : (
        <StatsGrid>
          <StatCard label="Chi nhánh" value={isLoading ? "…" : (stats?.locationCount ?? 0)} />
          <StatCard label="Phòng ban" value={isLoading ? "…" : (stats?.departmentCount ?? 0)} />
          <StatCard label="Nhân viên" value={isLoading ? "…" : (stats?.employeeCount ?? 0)} />
          <StatCard label="Tài khoản" value={isLoading ? "…" : (stats?.userCount ?? 0)} />
        </StatsGrid>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <PendingJoinRequestsWidget />

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium">Xu hướng hoạt động</h3>
            <Select value={windowDays} onValueChange={(v) => setWindowDays(v as UsageWindow)}>
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Mỗi đường là một loại hoạt động — nổi bật <span className="font-medium text-foreground">vào ca / ra ca</span>, các thao tác hệ thống khác (đăng nhập, lịch, chat) hiển thị mờ hơn.
          </p>
          <ActivityTrendChart
            data={chartData}
            series={activeSeries}
            isLoading={usageQuery.isLoading}
            isError={usageQuery.isError}
            className="mt-3"
          />
        </div>
      </div>
    </div>
  );
}
