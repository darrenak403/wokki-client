"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePlatformSupportContextQuery,
  usePlatformSupportSearchQuery,
} from "@/hooks/usePlatformOrganizations";
import {
  formatPlatformDate,
  formatPlatformDateTime,
  ledgerActionLabel,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
} from "@/lib/support/platform/format";

function matchTypeLabel(matchType: string): string {
  switch (matchType) {
    case "OrganizationId":
      return "Org ID";
    case "OrganizationName":
      return "Tên org";
    case "UserEmail":
      return "Email";
    default:
      return matchType || "—";
  }
}

export function PlatformSupportPanel() {
  const [query, setQuery] = useState("");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const searchQuery = usePlatformSupportSearchQuery({
    page: 1,
    pageSize: 30,
    query: query.trim() || undefined,
  });
  const contextQuery = usePlatformSupportContextQuery(
    selectedOrganizationId,
    Boolean(selectedOrganizationId)
  );
  const rows = searchQuery.data?.items ?? [];
  const context = contextQuery.data;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Support Console</h2>
          <p className="text-sm text-muted-foreground">Tra cứu org và trạng thái vận hành.</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="platform-support-query" className="text-xs text-muted-foreground">
            Tìm kiếm
          </Label>
          <Input
            id="platform-support-query"
            className="h-8 w-[320px]"
            placeholder="Org ID, tên org hoặc email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {searchQuery.isError ? (
        <p className="text-sm text-destructive">Không tải được dữ liệu support.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Org</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Gói</TableHead>
                <TableHead className="text-right">Counts</TableHead>
                <TableHead>Hoạt động gần nhất</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Đang tải…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Không có kết quả phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((item) => (
                  <TableRow key={`${item.organizationId}-${item.userId ?? item.matchType}`}>
                    <TableCell>
                      <Badge variant="outline">{matchTypeLabel(item.matchType)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.organizationName}</div>
                      <div className="text-xs text-muted-foreground">{item.organizationId}</div>
                    </TableCell>
                    <TableCell>
                      <div>{item.userEmail ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.userName ?? item.userRole ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriptionStatusVariant(item.subscriptionStatus)}>
                        {subscriptionStatusLabel(item.subscriptionStatus)}
                      </Badge>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatPlatformDate(item.subscriptionExpiresAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {item.userCount} user · {item.locationCount} CN · {item.employeeCount} NV
                    </TableCell>
                    <TableCell>{formatPlatformDateTime(item.latestOperationalActivityAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrganizationId(item.organizationId)}
                      >
                        Context
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet
        open={Boolean(selectedOrganizationId)}
        onOpenChange={(open) => !open && setSelectedOrganizationId(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{context?.organizationName ?? "Org context"}</SheetTitle>
            <SheetDescription>Ngữ cảnh hỗ trợ read-only.</SheetDescription>
          </SheetHeader>

          {contextQuery.isLoading ? (
            <p className="px-4 text-sm text-muted-foreground">Đang tải…</p>
          ) : contextQuery.isError ? (
            <p className="px-4 text-sm text-destructive">Không tải được context org.</p>
          ) : context ? (
            <div className="space-y-5 px-4 pb-6">
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={subscriptionStatusVariant(context.subscriptionStatus)}>
                    {subscriptionStatusLabel(context.subscriptionStatus)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {context.subscriptionDurationDays} ngày
                  </span>
                </div>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Kích hoạt</dt>
                    <dd>{formatPlatformDateTime(context.subscriptionActivatedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Hết hạn</dt>
                    <dd>{formatPlatformDateTime(context.subscriptionExpiresAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Cập nhật</dt>
                    <dd>{formatPlatformDateTime(context.subscriptionUpdatedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Tạo org</dt>
                    <dd>{formatPlatformDateTime(context.organizationCreatedAt)}</dd>
                  </div>
                </dl>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">User</div>
                  <div className="text-lg font-semibold">{context.userCount}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Nhân viên</div>
                  <div className="text-lg font-semibold">{context.employeeCount}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Chi nhánh</div>
                  <div className="text-lg font-semibold">{context.locationCount}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Phòng ban</div>
                  <div className="text-lg font-semibold">{context.departmentCount}</div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <h3 className="mb-2 font-medium">Hoạt động gần nhất</h3>
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Tạo lịch</dt>
                    <dd>{formatPlatformDateTime(context.latestScheduleCreatedAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Công bố lịch</dt>
                    <dd>{formatPlatformDateTime(context.latestSchedulePublishedAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Clock-in</dt>
                    <dd>{formatPlatformDateTime(context.latestAttendanceClockIn)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Chat</dt>
                    <dd>{formatPlatformDateTime(context.latestChatMessageAt)}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border p-3">
                <h3 className="mb-2 font-medium">Ledger gần nhất</h3>
                {context.latestSubscriptionLedgerEntry ? (
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Hành động</dt>
                      <dd>{ledgerActionLabel(context.latestSubscriptionLedgerEntry.action)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Trạng thái</dt>
                      <dd>
                        {subscriptionStatusLabel(context.latestSubscriptionLedgerEntry.previousStatus)} →{" "}
                        {subscriptionStatusLabel(context.latestSubscriptionLedgerEntry.newStatus)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Thời điểm</dt>
                      <dd>{formatPlatformDateTime(context.latestSubscriptionLedgerEntry.changedAt)}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có ledger.</p>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  );
}
