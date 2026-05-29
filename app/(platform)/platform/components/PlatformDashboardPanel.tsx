"use client";

import { usePlatformStatsQuery } from "@/hooks/usePlatformStats";
import { StatCard, StatsGrid } from "@/components/shared/stats/stat-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PlatformDashboardPanel() {
  const { data: stats, isLoading, isError } = usePlatformStatsQuery();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Thống kê nền tảng</h1>
        <p className="text-muted-foreground">
          Tổng hợp toàn instance — không truy cập dữ liệu vận hành từng tổ chức.
        </p>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>Không tải được thống kê nền tảng.</AlertDescription>
        </Alert>
      ) : (
        <StatsGrid columns={2}>
          <StatCard label="Tổ chức" value={isLoading ? "…" : (stats?.organizationCount ?? 0)} />
          <StatCard label="Tài khoản org" value={isLoading ? "…" : (stats?.userCount ?? 0)} />
          <StatCard label="Chi nhánh" value={isLoading ? "…" : (stats?.locationCount ?? 0)} />
          <StatCard label="Nhân viên" value={isLoading ? "…" : (stats?.employeeCount ?? 0)} />
        </StatsGrid>
      )}
    </div>
  );
}
