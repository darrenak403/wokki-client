"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatformUsageAnalyticsQuery } from "@/hooks/usePlatformOrganizations";
import {
  formatPlatformDate,
  formatPlatformDateTime,
  platformEventTypeLabel,
} from "@/lib/support/platform/format";

type UsageWindow = "7" | "30";

export function PlatformUsageAnalyticsPanel() {
  const [windowDays, setWindowDays] = useState<UsageWindow>("7");
  const [organizationId, setOrganizationId] = useState("");
  const query = usePlatformUsageAnalyticsQuery({
    windowDays: Number.parseInt(windowDays, 10) as 7 | 30,
    organizationId: organizationId.trim() || undefined,
  });

  const eventData = useMemo(
    () =>
      (query.data?.countsByEventType ?? []).map((item) => ({
        ...item,
        label: platformEventTypeLabel(item.eventType),
      })),
    [query.data?.countsByEventType]
  );
  const weeklyData = useMemo(
    () =>
      (query.data?.weeklyActiveOrganizations ?? []).map((item) => ({
        ...item,
        label: formatPlatformDate(item.weekStartDate),
      })),
    [query.data?.weeklyActiveOrganizations]
  );
  const topOrgData = useMemo(
    () =>
      (query.data?.topOrganizations ?? []).map((item) => ({
        ...item,
        label: item.organizationName.length > 18
          ? `${item.organizationName.slice(0, 18)}…`
          : item.organizationName,
      })),
    [query.data?.topOrganizations]
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Usage Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Active org tính từ login, lịch, attendance và chat trong cửa sổ đã chọn.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Cửa sổ</Label>
            <Select value={windowDays} onValueChange={(value) => setWindowDays(value as UsageWindow)}>
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="usage-org-id" className="text-xs text-muted-foreground">
              Org ID
            </Label>
            <Input
              id="usage-org-id"
              className="h-8 w-[300px]"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              placeholder="Drilldown optional"
            />
          </div>
        </div>
      </div>

      {query.isError ? (
        <p className="text-sm text-destructive">Không tải được usage analytics.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">Active org</div>
              <div className="mt-1 text-2xl font-semibold">
                {query.isLoading ? "…" : query.data?.activeOrganizationCount ?? 0}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">Từ</div>
              <div className="mt-1 text-lg font-semibold">
                {formatPlatformDateTime(query.data?.fromUtc)}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">Đến</div>
              <div className="mt-1 text-lg font-semibold">
                {formatPlatformDateTime(query.data?.toUtc)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-medium">Weekly active org</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="activeOrgCount"
                      stroke="#1d4ed8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-medium">Event count</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-medium">Top org activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topOrgData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="activityCount" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-medium">Last activity</h3>
              <div className="space-y-2">
                {(query.data?.activeOrganizations ?? []).slice(0, 10).map((org) => (
                  <div
                    key={org.organizationId}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{org.organizationName}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {org.organizationId}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <div>{org.activityCount} event</div>
                      <div>{formatPlatformDateTime(org.lastActivityAt)}</div>
                    </div>
                  </div>
                ))}
                {!query.isLoading && (query.data?.activeOrganizations ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có activity trong cửa sổ này.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
