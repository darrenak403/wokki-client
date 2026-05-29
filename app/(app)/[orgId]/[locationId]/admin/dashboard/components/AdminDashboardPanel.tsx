"use client";

import { useAuth } from "@/hooks/useAuth";
import { useOrgStatsQuery } from "@/hooks/useOrgStats";
import { StatCard, StatsGrid } from "@/components/shared/stats/stat-cards";
import { resolveOrganizationDisplayName } from "@/lib/support/auth/org-name-storage";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AdminDashboardPanel() {
  const { organizationName } = useAuth();
  const { data: stats, isLoading, isError } = useOrgStatsQuery();
  const orgLabel = resolveOrganizationDisplayName(organizationName);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-muted-foreground">
          Thống kê tổ chức <span className="font-medium text-foreground">{orgLabel}</span>
        </p>
      </div>

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
