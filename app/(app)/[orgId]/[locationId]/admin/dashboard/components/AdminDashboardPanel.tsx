"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useOrgStatsQuery, useOrgUsageAnalyticsQuery } from "@/hooks/useOrgStats";
import { usePendingOrgJoinRequestsQuery } from "@/hooks/useOrgJoin";
import { useOrgSubscriptionQuery } from "@/hooks/useOrgSubscription";
import { StatCard, StatsGrid } from "@/components/shared/stats/stat-cards";
import { ActionItemsList } from "@/components/shared/dashboard/action-items-list";
import { TrendChart } from "@/components/shared/dashboard/trend-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBSCRIPTION_STATUS_LABEL } from "@/lib/support/org/subscription";
import { platformEventTypeLabel } from "@/lib/support/platform/format";

type UsageWindow = "7" | "30";

export function AdminDashboardPanel() {
  const params = useParams<{ orgId: string; locationId: string }>();
  const { data: stats, isLoading, isError } = useOrgStatsQuery();

  const joinRequestsQuery = usePendingOrgJoinRequestsQuery();
  const pendingJoinRequests = joinRequestsQuery.data?.success
    ? joinRequestsQuery.data.data ?? []
    : [];

  const subscriptionQuery = useOrgSubscriptionQuery();

  const [windowDays, setWindowDays] = useState<UsageWindow>("7");
  const [eventType, setEventType] = useState<string>("all");
  const usageQuery = useOrgUsageAnalyticsQuery({
    windowDays: Number.parseInt(windowDays, 10) as 7 | 30,
  });

  const eventTypeOptions = useMemo(
    () => usageQuery.data?.countsByEventType.map((item) => item.eventType) ?? [],
    [usageQuery.data?.countsByEventType]
  );

  const chartData = useMemo(() => {
    const dailyCounts = usageQuery.data?.dailyCounts ?? [];
    const filtered =
      eventType === "all" ? dailyCounts : dailyCounts.filter((d) => d.eventType === eventType);

    const byDate = new Map<string, number>();
    for (const item of filtered) {
      byDate.set(item.date, (byDate.get(item.date) ?? 0) + item.count);
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }, [usageQuery.data?.dailyCounts, eventType]);

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
          <StatCard
            label="Gói dịch vụ"
            value={
              subscriptionQuery.isLoading
                ? "…"
                : (subscriptionQuery.data?.daysRemaining ?? "—")
            }
            description={
              subscriptionQuery.data?.subscriptionExpiresAt
                ? `Hết hạn ${new Date(subscriptionQuery.data.subscriptionExpiresAt).toLocaleDateString("vi-VN")}`
                : undefined
            }
            badge={
              subscriptionQuery.data
                ? {
                    label: SUBSCRIPTION_STATUS_LABEL[subscriptionQuery.data.subscriptionStatus],
                    variant:
                      subscriptionQuery.data.subscriptionStatus === "Active"
                        ? "default"
                        : subscriptionQuery.data.subscriptionStatus === "Expired" ||
                            subscriptionQuery.data.subscriptionStatus === "Disabled"
                          ? "destructive"
                          : "secondary",
                  }
                : undefined
            }
          />
        </StatsGrid>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <ActionItemsList
          title="Yêu cầu tham gia tổ chức"
          isLoading={joinRequestsQuery.isLoading}
          isError={joinRequestsQuery.isError}
          items={
            pendingJoinRequests.length > 0
              ? [
                  {
                    label: "Yêu cầu đang chờ duyệt",
                    count: pendingJoinRequests.length,
                    href: `/${params.orgId}/admin/join-requests`,
                  },
                ]
              : []
          }
          emptyLabel="Không có yêu cầu tham gia đang chờ."
        />

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium">Xu hướng hoạt động</h3>
            <div className="flex items-center gap-2">
              <Select
                value={eventType}
                onValueChange={(value) => setEventType(value ?? "all")}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {eventTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {platformEventTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>
          <TrendChart
            title=""
            data={chartData}
            isLoading={usageQuery.isLoading}
            isError={usageQuery.isError}
            className="border-none p-0 shadow-none"
          />
        </div>
      </div>
    </div>
  );
}
