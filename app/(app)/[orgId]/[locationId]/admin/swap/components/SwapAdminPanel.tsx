"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { SwapFeedCard } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapFeedCard";
import { SwapFeedCardList } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapFeedCardList";
import { SwapFeedHeader } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapFeedHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { useSwapPostAdminFeedQuery, useSwapPostAuditQuery } from "@/hooks/useSwapPosts";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import {
  formatSwapShiftLine,
  swapPostTypeLabel,
} from "@/lib/support/employee/swap-post-status";
import { addWeeksISO, toMondayISO } from "@/lib/support/schedule/week";
import { cn } from "@/lib/utils";

type Tab = "feed" | "audit";

function WeekPicker({
  weekLabel,
  onPrev,
  onNext,
}: {
  weekLabel: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border bg-background px-0.5 py-0.5">
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Tuần trước" onClick={onPrev}>
        <ChevronLeftIcon className="size-4" />
      </Button>
      <span className="min-w-[8.5rem] px-1 text-center text-sm font-medium tabular-nums">
        {weekLabel}
      </span>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Tuần sau" onClick={onNext}>
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
}

function AdminTabs({
  tab,
  feedCount,
  auditCount,
  onChange,
}: {
  tab: Tab;
  feedCount: number;
  auditCount: number;
  onChange: (tab: Tab) => void;
}) {
  return (
    <div className="flex rounded-lg border bg-muted/30 p-0.5">
      {(["feed", "audit"] as const).map((key) => (
        <button
          key={key}
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onChange(key)}
        >
          {key === "feed" ? "Bảng tin" : "Nhật ký"}
          {key === "feed" && feedCount > 0 ? ` (${feedCount})` : ""}
          {key === "audit" && auditCount > 0 ? ` (${auditCount})` : ""}
        </button>
      ))}
    </div>
  );
}

export function SwapAdminPanel() {
  const { session } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;
  const [weekStartDate, setWeekStartDate] = useState(() => addWeeksISO(toMondayISO(new Date()), 1));
  const [tab, setTab] = useState<Tab>("feed");

  const listParams = useMemo(
    () => ({
      page: 1,
      pageSize: 50,
      weekStartDate,
      ...(locationId ? { locationId } : {}),
      ...(departmentId ? { departmentId } : {}),
    }),
    [weekStartDate, locationId, departmentId],
  );

  const enabled = Boolean(locationId);

  const {
    data: feedPage,
    isLoading: feedLoading,
    isError: feedError,
    error: feedErr,
  } = useSwapPostAdminFeedQuery(listParams, enabled);

  const {
    data: auditPage,
    isLoading: auditLoading,
    isError: auditError,
    error: auditErr,
  } = useSwapPostAuditQuery(listParams, enabled);

  const feedItems = feedPage?.items ?? [];
  const auditItems = auditPage?.items ?? [];
  const listError = feedError
    ? mapEmployeeError(feedErr)
    : auditError
      ? mapEmployeeError(auditErr)
      : null;

  const weekLabel = useMemo(() => {
    const start = parseISO(weekStartDate);
    const end = parseISO(addWeeksISO(weekStartDate, 1));
    end.setDate(end.getDate() - 1);
    return `${format(start, "dd/MM", { locale: vi })} – ${format(end, "dd/MM/yyyy", { locale: vi })}`;
  }, [weekStartDate]);

  const toolbar = (
    <>
      <WeekPicker
        weekLabel={weekLabel}
        onPrev={() => setWeekStartDate((current) => addWeeksISO(current, -1))}
        onNext={() => setWeekStartDate((current) => addWeeksISO(current, 1))}
      />
      <AdminTabs
        tab={tab}
        feedCount={feedItems.length}
        auditCount={auditItems.length}
        onChange={setTab}
      />
    </>
  );

  if (!locationId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Chọn chi nhánh trong workspace để xem đổi ca.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Đổi ca</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem bảng tin và nhật ký đổi ca theo phòng ban — chỉ xem, không duyệt thủ công.
        </p>
      </header>

      {listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : null}

      {tab === "feed" ? (
        <>
          <SwapFeedHeader toolbar={toolbar} />

          <SwapFeedCardList
            title="Bài đăng đang mở"
            count={feedItems.length}
            loading={feedLoading}
            empty={
              !feedLoading && feedItems.length === 0 ? (
                <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                  Chưa có bài đăng tuần này
                  {departmentId ? " trong phòng ban đã chọn" : ""}.
                </div>
              ) : undefined
            }
          >
            {feedItems.map((post) => (
              <SwapFeedCard
                key={post.id}
                post={post}
                onAcceptCover={() => undefined}
                onAcceptCrossSwap={() => undefined}
              />
            ))}
          </SwapFeedCardList>
        </>
      ) : (
        <>
          <SwapFeedHeader toolbar={toolbar} />

          <section className="space-y-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-semibold">Nhật ký đổi ca</h2>
              {auditItems.length > 0 ? (
                <span className="text-sm text-muted-foreground">({auditItems.length})</span>
              ) : null}
            </div>

            {auditLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Đang tải…</p>
            ) : auditItems.length === 0 ? (
              <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                Chưa có đổi ca thành công tuần này
                {departmentId ? " trong phòng ban đã chọn" : ""}.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Phòng ban</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Người đăng</TableHead>
                      <TableHead>Người nhận</TableHead>
                      <TableHead>Ca đăng</TableHead>
                      <TableHead>Ca nhận</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditItems.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(parseISO(row.completedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </TableCell>
                        <TableCell className="text-sm">{row.departmentName ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{swapPostTypeLabel(row.type)}</Badge>
                        </TableCell>
                        <TableCell>{row.author.displayName}</TableCell>
                        <TableCell>{row.acceptedBy?.displayName ?? "—"}</TableCell>
                        <TableCell className="text-sm">
                          {formatSwapShiftLine(
                            row.offeredShift.shiftName,
                            row.offeredShift.startTime,
                            row.offeredShift.endTime,
                            row.offeredShift.date,
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.acceptedShift
                            ? formatSwapShiftLine(
                                row.acceptedShift.shiftName,
                                row.acceptedShift.startTime,
                                row.acceptedShift.endTime,
                                row.acceptedShift.date,
                              )
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
