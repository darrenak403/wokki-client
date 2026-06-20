"use client";

import { useState } from "react";
import { usePendingOrgJoinRequestsQuery } from "@/hooks/useOrgJoin";
import { ApproveJoinRequestDialog } from "@/components/shared/org-join/approve-join-request-dialog";
import { Button } from "@/components/ui/button";
import type { PendingOrgJoinRequestResponse } from "@/types/org-join";

const MAX_VISIBLE = 5;

export function PendingJoinRequestsWidget() {
  const { data, isLoading, isError } = usePendingOrgJoinRequestsQuery();
  const rows: PendingOrgJoinRequestResponse[] = data?.success ? (data.data ?? []) : [];

  const [approveTarget, setApproveTarget] = useState<PendingOrgJoinRequestResponse | null>(null);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="font-medium">Yêu cầu tham gia tổ chức</h3>

      {isError ? (
        <p className="mt-3 text-sm text-destructive">Không tải được yêu cầu tham gia.</p>
      ) : isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">Đang tải…</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Không có yêu cầu tham gia đang chờ.</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.slice(0, MAX_VISIBLE).map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 py-2">
              <button
                type="button"
                onClick={() => setApproveTarget(row)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-sm font-medium">
                  {row.firstName} {row.lastName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{row.email}</span>
              </button>
              <Button type="button" size="sm" className="shrink-0" onClick={() => setApproveTarget(row)}>
                Duyệt
              </Button>
            </li>
          ))}
        </ul>
      )}

      {rows.length > MAX_VISIBLE ? (
        <p className="mt-2 text-xs text-muted-foreground">
          và {rows.length - MAX_VISIBLE} yêu cầu khác.
        </p>
      ) : null}

      <ApproveJoinRequestDialog target={approveTarget} onClose={() => setApproveTarget(null)} />
    </div>
  );
}
