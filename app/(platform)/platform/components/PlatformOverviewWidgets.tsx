"use client";

import { useMemo } from "react";
import { ActionItemsList, type ActionItem } from "@/components/shared/dashboard/action-items-list";
import { TrendChart, type ChartDatum } from "@/components/shared/dashboard/trend-chart";
import { usePlatformOrganizationsQuery, usePlatformUsageAnalyticsQuery } from "@/hooks/usePlatformOrganizations";
import { formatPlatformDate } from "@/lib/support/platform/format";

const EXPIRING_WITHIN_DAYS = 14;

export function PlatformOverviewWidgets() {
  const expiringQuery = usePlatformOrganizationsQuery({
    page: 1,
    pageSize: 10,
    status: "Active",
    sortBy: "expiryDate",
    sortDirection: "asc",
    expiringWithinDays: EXPIRING_WITHIN_DAYS,
  });

  const expiringItems: ActionItem[] = useMemo(
    () =>
      (expiringQuery.data?.items ?? [])
        .filter((org) => org.isExpiringSoon)
        .map((org) => ({
          label: `${org.name} — hết hạn ${formatPlatformDate(org.subscriptionExpiresAt)}`,
          count: org.daysUntilExpiry ?? 0,
          href: "/platform",
        })),
    [expiringQuery.data?.items],
  );

  const usageQuery = usePlatformUsageAnalyticsQuery({ windowDays: 30 });

  const trendData: ChartDatum[] = useMemo(
    () =>
      (usageQuery.data?.weeklyActiveOrganizations ?? []).map((item) => ({
        date: formatPlatformDate(item.weekStartDate),
        value: item.activeOrgCount,
      })),
    [usageQuery.data?.weeklyActiveOrganizations],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ActionItemsList
        title={`Tổ chức sắp hết hạn gói (${EXPIRING_WITHIN_DAYS} ngày tới)`}
        isLoading={expiringQuery.isLoading}
        isError={expiringQuery.isError}
        items={expiringItems}
        emptyLabel="Không có tổ chức nào sắp hết hạn gói."
      />

      <TrendChart
        title="Active org theo tuần (30 ngày)"
        data={trendData}
        isLoading={usageQuery.isLoading}
        isError={usageQuery.isError}
      />
    </div>
  );
}
