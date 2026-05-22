"use client";

import { useMemo, useState } from "react";
import { SwapCreateForm } from "@/app/(app)/user/swap/components/swap-create-form";
import { SwapRequestList } from "@/app/(app)/user/swap/components/swap-request-list";
import { Button } from "@/components/ui/button";
import { NoEmployeeLinked } from "@/app/(app)/user/components/no-employee-linked";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { useMySwapRequestsQuery } from "@/hooks/useSwapRequests";
import { inferMyEmployeeId } from "@/lib/support/employee/infer-employee-id";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import type { ApiError } from "@/types/api";
import { SWAP_STATUS } from "@/types/employee";

type Tab = "send" | "receive";

export function SwapPanel() {
  const [tab, setTab] = useState<Tab>("send");
  const { data: myAssignments = [], isError: scheduleError, error: scheduleErr } =
    useMyScheduleQuery();
  const { data: swaps = [], isLoading, isError: swapsError, error: swapsErr } =
    useMySwapRequestsQuery();

  const scheduleErrorCode =
    scheduleError && scheduleErr && typeof scheduleErr === "object" && "messageCode" in scheduleErr
      ? (scheduleErr as unknown as ApiError).messageCode
      : undefined;
  if (scheduleErrorCode === "ME_NO_EMPLOYEE") {
    return <NoEmployeeLinked />;
  }

  const myEmployeeId = useMemo(
    () => inferMyEmployeeId(myAssignments, swaps),
    [myAssignments, swaps],
  );

  const { incoming, outgoing } = useMemo(() => {
    if (!myEmployeeId) {
      return { incoming: [], outgoing: [] };
    }
    return {
      incoming: swaps.filter(
        (s) => s.targetEmployeeId === myEmployeeId && s.status === SWAP_STATUS.Pending,
      ),
      outgoing: swaps.filter((s) => s.requesterId === myEmployeeId),
    };
  }, [swaps, myEmployeeId]);

  const pendingIncomingCount = incoming.length;
  const listError = swapsError ? mapEmployeeError(swapsErr) : null;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={tab === "send" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("send")}
        >
          Gửi yêu cầu
        </Button>
        <Button
          variant={tab === "receive" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("receive")}
        >
          Nhận từ đối tác
          {pendingIncomingCount > 0 ? ` (${pendingIncomingCount})` : ""}
        </Button>
      </div>

      {listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : null}

      {tab === "send" ? (
        <>
          <SwapCreateForm myEmployeeId={myEmployeeId} />
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          ) : (
            <SwapRequestList
              title="Yêu cầu đã gửi"
              items={outgoing}
              mode="outgoing"
              myEmployeeId={myEmployeeId}
            />
          )}
        </>
      ) : (
        <>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          ) : (
            <SwapRequestList
              title="Chờ bạn phản hồi"
              items={incoming}
              mode="incoming"
              myEmployeeId={myEmployeeId}
            />
          )}
          <SwapRequestList
            title="Tất cả yêu cầu liên quan"
            items={swaps.filter((s) => s.targetEmployeeId === myEmployeeId)}
            mode="incoming"
            myEmployeeId={myEmployeeId}
          />
        </>
      )}
    </div>
  );
}
