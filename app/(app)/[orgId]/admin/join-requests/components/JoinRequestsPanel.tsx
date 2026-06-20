"use client";

import { useState } from "react";
import { usePendingOrgJoinRequestsQuery } from "@/hooks/useOrgJoin";
import { ApproveJoinRequestDialog } from "@/components/shared/org-join/approve-join-request-dialog";
import { RejectJoinRequestDialog } from "@/components/shared/org-join/reject-join-request-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PendingOrgJoinRequestResponse } from "@/types/org-join";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function JoinRequestsPanel() {
  const { data, isLoading, refetch } = usePendingOrgJoinRequestsQuery();
  const rows: PendingOrgJoinRequestResponse[] = data?.success ? (data.data ?? []) : [];

  const [approveTarget, setApproveTarget] = useState<PendingOrgJoinRequestResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingOrgJoinRequestResponse | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Yêu cầu tham gia</h1>
          <p className="text-sm text-muted-foreground">
            Nhân viên tự đăng ký — duyệt và gán chi nhánh, phòng ban trước khi họ vào app.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Làm mới
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có yêu cầu đang chờ duyệt.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Gửi lúc</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    {row.firstName} {row.lastName}
                    {row.phone ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{row.phone}</span>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatDate(row.submittedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" size="sm" onClick={() => setApproveTarget(row)}>
                        Duyệt
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectTarget(row)}
                      >
                        Từ chối
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ApproveJoinRequestDialog target={approveTarget} onClose={() => setApproveTarget(null)} />
      <RejectJoinRequestDialog target={rejectTarget} onClose={() => setRejectTarget(null)} />
    </div>
  );
}
