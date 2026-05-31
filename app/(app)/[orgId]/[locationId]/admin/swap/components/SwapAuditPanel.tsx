"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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
import { useSwapPostAuditQuery } from "@/hooks/useSwapPosts";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import {
  formatSwapShiftLine,
  swapPostTypeLabel,
} from "@/lib/support/employee/swap-post-status";
import { addWeeksISO, toMondayISO } from "@/lib/support/schedule/week";

export function SwapAuditPanel() {
  const { session } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const [weekStartDate, setWeekStartDate] = useState(() => addWeeksISO(toMondayISO(new Date()), 1));

  const listParams = useMemo(
    () => ({
      page: 1,
      pageSize: 50,
      weekStartDate,
      ...(locationId ? { locationId } : {}),
    }),
    [weekStartDate, locationId],
  );

  const { data, isLoading, isError, error } = useSwapPostAuditQuery(listParams, Boolean(locationId));
  const items = data?.items ?? [];
  const listError = isError ? mapEmployeeError(error) : null;

  const weekLabel = useMemo(() => {
    const start = parseISO(weekStartDate);
    const end = parseISO(addWeeksISO(weekStartDate, 1));
    end.setDate(end.getDate() - 1);
    return `${format(start, "dd/MM", { locale: vi })} – ${format(end, "dd/MM/yyyy", { locale: vi })}`;
  }, [weekStartDate]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Nhật ký đổi ca</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Các ca đã đổi thành công trên lịch Draft — chỉ xem, không duyệt thủ công.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-card p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Tuần trước"
            onClick={() => setWeekStartDate((current) => addWeeksISO(current, -1))}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="min-w-36 text-center text-sm font-medium tabular-nums">{weekLabel}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Tuần sau"
            onClick={() => setWeekStartDate((current) => addWeeksISO(current, 1))}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      {!locationId ? (
        <p className="text-sm text-muted-foreground">Chọn chi nhánh trong workspace để xem nhật ký.</p>
      ) : listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có đổi ca nào trong tuần này.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Người đăng</TableHead>
                <TableHead>Người nhận</TableHead>
                <TableHead>Ca đăng</TableHead>
                <TableHead>Ca nhận</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(parseISO(row.completedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </TableCell>
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
    </div>
  );
}
