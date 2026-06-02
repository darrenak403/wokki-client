"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePlatformOrganizationSubscriptionLedgerQuery,
  usePlatformSubscriptionLedgerQuery,
} from "@/hooks/usePlatformOrganizations";
import {
  formatPlatformDate,
  formatPlatformDateTime,
  ledgerActionLabel,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
  toEndOfDayUtc,
  toStartOfDayUtc,
} from "@/lib/support/platform/format";
import type { PlatformOrganizationResponse } from "@/types/platform";

type LedgerActionFilter = "all" | "Activated" | "Renewed" | "Disabled" | "DurationChanged";

type PlatformSubscriptionLedgerPanelProps = {
  scopedOrganization?: PlatformOrganizationResponse | null;
  onClearScopedOrganization?: () => void;
};

export function PlatformSubscriptionLedgerPanel({
  scopedOrganization,
  onClearScopedOrganization,
}: PlatformSubscriptionLedgerPanelProps) {
  const [organizationId, setOrganizationId] = useState("");
  const [action, setAction] = useState<LedgerActionFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (scopedOrganization) setOrganizationId(scopedOrganization.id);
  }, [scopedOrganization]);

  const queryParams = useMemo(
    () => ({
      page: 1,
      pageSize: 50,
      organizationId: organizationId.trim() || undefined,
      action: action === "all" ? undefined : action,
      from: toStartOfDayUtc(fromDate),
      to: toEndOfDayUtc(toDate),
    }),
    [action, fromDate, organizationId, toDate]
  );

  const useScopedEndpoint = Boolean(scopedOrganization?.id && organizationId === scopedOrganization.id);
  const globalQuery = usePlatformSubscriptionLedgerQuery(queryParams, !useScopedEndpoint);
  const scopedQuery = usePlatformOrganizationSubscriptionLedgerQuery(
    scopedOrganization?.id ?? null,
    {
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      action: queryParams.action,
      from: queryParams.from,
      to: queryParams.to,
    },
    useScopedEndpoint
  );
  const query = useScopedEndpoint ? scopedQuery : globalQuery;
  const rows = query.data?.items ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Ledger gói sử dụng</h2>
          <p className="text-sm text-muted-foreground">Lịch sử thay đổi gói của platform.</p>
        </div>
        {scopedOrganization ? (
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <span className="font-medium">{scopedOrganization.name}</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setOrganizationId("");
                onClearScopedOrganization?.();
              }}
            >
              Bỏ lọc
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="ledger-org-id" className="text-xs text-muted-foreground">
            Org ID
          </Label>
          <Input
            id="ledger-org-id"
            className="h-8 w-[300px]"
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            placeholder="UUID tổ chức"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Hành động</Label>
          <Select value={action} onValueChange={(value) => setAction(value as LedgerActionFilter)}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Activated">Kích hoạt</SelectItem>
              <SelectItem value="Renewed">Gia hạn</SelectItem>
              <SelectItem value="Disabled">Tắt gói</SelectItem>
              <SelectItem value="DurationChanged">Đổi thời hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="ledger-from" className="text-xs text-muted-foreground">
            Từ ngày
          </Label>
          <Input
            id="ledger-from"
            className="h-8 w-[150px]"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ledger-to" className="text-xs text-muted-foreground">
            Đến ngày
          </Label>
          <Input
            id="ledger-to"
            className="h-8 w-[150px]"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {query.isError ? (
        <p className="text-sm text-destructive">Không tải được ledger gói sử dụng.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời điểm</TableHead>
                <TableHead>Org</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Hết hạn</TableHead>
                <TableHead>Operator</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Đang tải…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Chưa có ledger phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatPlatformDateTime(entry.changedAt)}</TableCell>
                    <TableCell className="max-w-[220px] truncate font-mono text-xs">
                      {entry.organizationId}
                    </TableCell>
                    <TableCell>{ledgerActionLabel(entry.action)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={subscriptionStatusVariant(entry.previousStatus)}>
                          {subscriptionStatusLabel(entry.previousStatus)}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant={subscriptionStatusVariant(entry.newStatus)}>
                          {subscriptionStatusLabel(entry.newStatus)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.previousDurationDays} → {entry.newDurationDays} ngày
                    </TableCell>
                    <TableCell>
                      {formatPlatformDate(entry.previousExpiresAt)} →{" "}
                      {formatPlatformDate(entry.newExpiresAt)}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate font-mono text-xs">
                      {entry.changedByUserId}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
