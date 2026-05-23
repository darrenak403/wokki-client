"use client";

import { useMemo, useState } from "react";
import { CheckCircle2Icon, Clock3Icon, XCircleIcon } from "lucide-react";
import { SwapCreateForm } from "@/app/(app)/user/swap/components/SwapCreateForm";
import { SwapRequestList } from "@/app/(app)/user/swap/components/SwapRequestList";
import { Button } from "@/components/ui/button";
import { NoEmployeeLinked } from "@/app/(app)/user/components/NoEmployeeLinked";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { useMySwapRequestsQuery } from "@/hooks/useSwapRequests";
import { inferMyEmployeeId } from "@/lib/support/employee/infer-employee-id";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/api";
import { SWAP_STATUS } from "@/types/employee";

type Tab = "send" | "receive";

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "pending" | "approved" | "rejected";
  icon: typeof Clock3Icon;
}) {
  const toneClass = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    rejected: "bg-destructive/10 text-destructive",
  }[tone];

  return (
    <div className="flex items-center gap-5 rounded-lg border bg-card p-5 shadow-sm">
      <span className={cn("flex size-14 items-center justify-center rounded-full", toneClass)}>
        <Icon className="size-7" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

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

  const myEmployeeId = useMemo(
    () => inferMyEmployeeId(myAssignments, swaps),
    [myAssignments, swaps],
  );

  const { incoming, outgoing, stats } = useMemo(() => {
    const pending = swaps.filter((swap) => swap.status === SWAP_STATUS.Pending).length;
    const approved = swaps.filter((swap) => swap.status === SWAP_STATUS.ManagerApproved).length;
    const rejected = swaps.filter(
      (swap) =>
        swap.status === SWAP_STATUS.PeerDeclined ||
        swap.status === SWAP_STATUS.ManagerRejected ||
        swap.status === SWAP_STATUS.Cancelled,
    ).length;

    if (!myEmployeeId) {
      return { incoming: [], outgoing: [], stats: { pending, approved, rejected } };
    }

    return {
      incoming: swaps.filter(
        (swap) => swap.targetEmployeeId === myEmployeeId && swap.status === SWAP_STATUS.Pending,
      ),
      outgoing: swaps.filter((swap) => swap.requesterId === myEmployeeId),
      stats: { pending, approved, rejected },
    };
  }, [swaps, myEmployeeId]);

  const listError = swapsError ? mapEmployeeError(swapsErr) : null;

  if (scheduleErrorCode === "ME_NO_EMPLOYEE") {
    return <NoEmployeeLinked />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Đang chờ" value={stats.pending} tone="pending" icon={Clock3Icon} />
        <StatCard label="Đã duyệt" value={stats.approved} tone="approved" icon={CheckCircle2Icon} />
        <StatCard label="Từ chối/Hủy" value={stats.rejected} tone="rejected" icon={XCircleIcon} />
      </section>

      {listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : null}

      <section className="grid items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <SwapCreateForm myEmployeeId={myEmployeeId} />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Danh sách yêu cầu</h2>
            <div className="flex rounded-lg border bg-card p-1">
              <Button
                variant={tab === "send" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTab("send")}
              >
                Đã gửi
              </Button>
              <Button
                variant={tab === "receive" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTab("receive")}
              >
                Cần phản hồi
                {incoming.length > 0 ? ` (${incoming.length})` : ""}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          ) : tab === "send" ? (
            <SwapRequestList
              title="Yêu cầu đã gửi"
              items={outgoing}
              mode="outgoing"
              myEmployeeId={myEmployeeId}
            />
          ) : (
            <SwapRequestList
              title="Chờ bạn phản hồi"
              items={incoming}
              mode="incoming"
              myEmployeeId={myEmployeeId}
            />
          )}
        </div>
      </section>
    </div>
  );
}
