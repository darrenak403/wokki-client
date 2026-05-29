"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckIcon, ClockIcon, XIcon } from "lucide-react";
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
import {
  useAcceptSwapMutation,
  useCancelSwapMutation,
  useDeclineSwapMutation,
} from "@/hooks/useSwapRequests";
import { isSwapPending, swapStatusLabel } from "@/lib/support/employee/swap-status";
import { cn } from "@/lib/utils";
import { SWAP_STATUS, type SwapRequestResponse, type SwapStatus } from "@/types/employee";

type SwapRequestListProps = {
  title: string;
  items: SwapRequestResponse[];
  mode: "incoming" | "outgoing";
  myEmployeeId: string | null;
};

function toTime(value?: string | null) {
  return value?.slice(0, 5) ?? "--:--";
}

function statusTone(status: SwapStatus) {
  switch (status) {
    case SWAP_STATUS.Pending:
      return {
        icon: ClockIcon,
        badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
        center: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      };
    case SWAP_STATUS.ManagerApproved:
    case SWAP_STATUS.PeerAccepted:
      return {
        icon: CheckIcon,
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
        center: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      };
    default:
      return {
        icon: XIcon,
        badge: "border-destructive/20 bg-destructive/10 text-destructive",
        center: "bg-destructive/10 text-destructive",
      };
  }
}

function ShiftSummary({
  label,
  name,
  date,
  startTime,
  endTime,
}: {
  label: string;
  name?: string | null;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}) {
  return (
    <div className="min-w-0 flex-1 rounded-lg bg-primary/5 p-4">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 truncate font-semibold text-brand-navy dark:text-foreground">
        {name ?? "Ca làm việc"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {toTime(startTime)} - {toTime(endTime)}
      </p>
      {date ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {format(parseISO(date), "EEEE, dd/MM", { locale: vi })}
        </p>
      ) : null}
    </div>
  );
}

export function SwapRequestList({ title, items, mode, myEmployeeId }: SwapRequestListProps) {
  const acceptMutation = useAcceptSwapMutation();
  const declineMutation = useDeclineSwapMutation();
  const cancelMutation = useCancelSwapMutation();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">{title}: chưa có yêu cầu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <span className="text-sm text-muted-foreground">{items.length} yêu cầu</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ca của bạn</TableHead>
            <TableHead>Ca đối tác</TableHead>
            <TableHead>Cập nhật</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead className="w-[180px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
        {items.map((swap) => {
          const pending = isSwapPending(swap.status);
          const canAccept =
            mode === "incoming" &&
            pending &&
            myEmployeeId &&
            swap.targetEmployeeId === myEmployeeId;
          const canCancel =
            mode === "outgoing" &&
            pending &&
            myEmployeeId &&
            swap.requesterId === myEmployeeId;
          const tone = statusTone(swap.status);
          const StatusIcon = tone.icon;

          return (
            <TableRow key={swap.id}>
              <TableCell>
                <Badge variant="outline" className={cn("gap-1 rounded-md border", tone.badge)}>
                  <StatusIcon className="size-3" />
                  {swapStatusLabel(swap.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <ShiftSummary
                  label="Ca của bạn"
                  name={swap.requesterShiftName}
                  date={swap.requesterShiftDate}
                  startTime={swap.requesterStartTime}
                  endTime={swap.requesterEndTime}
                />
              </TableCell>
              <TableCell>
                <ShiftSummary
                  label="Ca đối tác"
                  name={swap.targetShiftName}
                  date={swap.targetShiftDate}
                  startTime={swap.targetStartTime}
                  endTime={swap.targetEndTime}
                />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(swap.updatedAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
              </TableCell>
              <TableCell className="max-w-sm truncate text-muted-foreground">
                {swap.requesterNote ? `“${swap.requesterNote}”` : "—"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-2">
                {canAccept ? (
                  <>
                    <Button
                      size="sm"
                      disabled={acceptMutation.isPending || declineMutation.isPending}
                      onClick={() => void acceptMutation.mutateAsync({ swapId: swap.id })}
                    >
                      <CheckIcon className="size-4" />
                      Chấp nhận
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={acceptMutation.isPending || declineMutation.isPending}
                      onClick={() => void declineMutation.mutateAsync({ swapId: swap.id })}
                    >
                      <XIcon className="size-4" />
                      Từ chối
                    </Button>
                  </>
                ) : null}
                {canCancel ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={cancelMutation.isPending}
                    onClick={() => void cancelMutation.mutateAsync({ swapId: swap.id })}
                  >
                    <XIcon className="size-4" />
                    Hủy yêu cầu
                  </Button>
                ) : null}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        </TableBody>
      </Table>
    </div>
  );
}
