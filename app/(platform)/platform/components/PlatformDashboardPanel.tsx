"use client";

import { usePlatformStatsQuery } from "@/hooks/usePlatformStats";
import { StatCard, StatsGrid } from "@/components/shared/stats/stat-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PlatformDashboardPanel() {
  const { data: stats, isLoading, isError } = usePlatformStatsQuery();

  return (
    <div className="space-y-6">
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
