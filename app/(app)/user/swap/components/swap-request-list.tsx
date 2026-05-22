"use client";

import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAcceptSwapMutation,
  useCancelSwapMutation,
  useDeclineSwapMutation,
} from "@/hooks/useSwapRequests";
import { isSwapPending, swapStatusLabel } from "@/lib/support/employee/swap-status";
import { SWAP_STATUS, type SwapRequestResponse } from "@/types/employee";

type SwapRequestListProps = {
  title: string;
  items: SwapRequestResponse[];
  mode: "incoming" | "outgoing";
  myEmployeeId: string | null;
};

export function SwapRequestList({ title, items, mode, myEmployeeId }: SwapRequestListProps) {
  const acceptMutation = useAcceptSwapMutation();
  const declineMutation = useDeclineSwapMutation();
  const cancelMutation = useCancelSwapMutation();

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">{title}: chưa có yêu cầu.</p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="space-y-3">
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

          return (
            <li key={swap.id} className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={pending ? "secondary" : "outline"}>
                  {swapStatusLabel(swap.status)}
                </Badge>
                <span className="text-muted-foreground text-xs">{swap.id.slice(0, 8)}…</span>
              </div>
              <p>
                Ca bạn: {format(parseISO(swap.requesterShiftDate), "dd/MM")} → Đối tác:{" "}
                {format(parseISO(swap.targetShiftDate), "dd/MM")}
              </p>
              {swap.requesterNote ? (
                <p className="text-muted-foreground">“{swap.requesterNote}”</p>
              ) : null}
              <div className="flex gap-2">
                {canAccept ? (
                  <>
                    <Button
                      size="sm"
                      disabled={acceptMutation.isPending || declineMutation.isPending}
                      onClick={() => void acceptMutation.mutateAsync({ swapId: swap.id })}
                    >
                      Chấp nhận
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={acceptMutation.isPending || declineMutation.isPending}
                      onClick={() => void declineMutation.mutateAsync({ swapId: swap.id })}
                    >
                      Từ chối
                    </Button>
                  </>
                ) : null}
                {canCancel ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={cancelMutation.isPending}
                    onClick={() => void cancelMutation.mutateAsync({ swapId: swap.id })}
                  >
                    Hủy yêu cầu
                  </Button>
                ) : null}
                {swap.status === SWAP_STATUS.ManagerApproved ? (
                  <span className="text-xs text-muted-foreground">Đã hoàn tất đổi ca</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
