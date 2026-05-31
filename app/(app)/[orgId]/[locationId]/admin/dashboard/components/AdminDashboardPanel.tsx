"use client";

import { useOrgStatsQuery } from "@/hooks/useOrgStats";
import { StatCard, StatsGrid } from "@/components/shared/stats/stat-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AdminDashboardPanel() {
  const { data: stats, isLoading, isError } = useOrgStatsQuery();

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
          <StatCard
            label="Thành viên active"
            value={isLoading ? "…" : (stats?.activeLocationMembershipCount ?? 0)}
          />
          <StatCard label="Tài khoản" value={isLoading ? "…" : (stats?.userCount ?? 0)} />
        </StatsGrid>
      )}
    </div>
  );
}
