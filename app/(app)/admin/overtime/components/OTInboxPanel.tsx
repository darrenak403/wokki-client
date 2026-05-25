"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  useApproveOTMutation,
  usePendingOTRequestsQuery,
  useRejectOTMutation,
} from "@/hooks/useOvertimeRequests";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import type { OvertimeRequestResponse } from "@/types/overtime";

type ActionKind = "approve" | "reject" | null;

interface OTInboxPanelProps {
  departmentId?: string;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export function OTInboxPanel({ departmentId: propDepartmentId }: OTInboxPanelProps) {
  const { session } = useFoundationSession();
  const effectiveDepartmentId = propDepartmentId ?? session.selectedDepartmentId;

  const [actionKind, setActionKind] = useState<ActionKind>(null);
  const [activeRequest, setActiveRequest] = useState<OvertimeRequestResponse | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const params = effectiveDepartmentId ? { departmentId: effectiveDepartmentId } : undefined;
  const { data, isLoading, isError, error } = usePendingOTRequestsQuery(params);
  const approveMutation = useApproveOTMutation();
  const rejectMutation = useRejectOTMutation();

  const items = data?.items ?? [];
  const listError = isError ? mapEmployeeError(error) : null;

  const openAction = (kind: ActionKind, req: OvertimeRequestResponse) => {
    setActionKind(kind);
    setActiveRequest(req);
    setReviewNote("");
  };

  const closeAction = () => {
    setActionKind(null);
    setActiveRequest(null);
    setReviewNote("");
  };

  const handleConfirm = async () => {
    if (!activeRequest) return;
    const payload = { id: activeRequest.id, data: { reviewNote: reviewNote || null } };
    if (actionKind === "approve") {
      await approveMutation.mutateAsync(payload);
    } else {
      await rejectMutation.mutateAsync(payload);
    }
    closeAction();
  };

  const actionPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-4">
      {!effectiveDepartmentId ? (
        <p className="text-sm text-muted-foreground">Chọn phòng ban để xem yêu cầu tăng ca.</p>
      ) : listError ? (
        <p className="text-sm text-destructive" role="alert">{listError}</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có yêu cầu tăng ca đang chờ duyệt.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Ca</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Bắt đầu</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="whitespace-nowrap">
                    {req.employeeFirstName} {req.employeeLastName}
                  </TableCell>
                  <TableCell>{req.shiftName ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {req.scheduledDate ? format(parseISO(req.scheduledDate), "dd/MM/yyyy") : "—"}
                  </TableCell>
                  <TableCell
                    className="max-w-[200px]"
                    title={req.reason}
                  >
                    {truncate(req.reason, 60)}
                  </TableCell>
                  <TableCell className="tabular-nums whitespace-nowrap">
                    {format(parseISO(req.startedAt), "HH:mm dd/MM")}
                  </TableCell>
                  <TableCell>
                    {req.overtimeMinutes != null ? `${req.overtimeMinutes} phút` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                        onClick={() => openAction("approve", req)}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() => openAction("reject", req)}
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

      <Dialog open={actionKind !== null} onOpenChange={(open) => !open && closeAction()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionKind === "approve" ? "Duyệt yêu cầu tăng ca" : "Từ chối yêu cầu tăng ca"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {activeRequest
                ? `${activeRequest.employeeFirstName ?? ""} ${activeRequest.employeeLastName ?? ""} — ${truncate(activeRequest.reason, 80)}`
                : ""}
            </p>
            <div className="space-y-1">
              <Label className="text-sm">Ghi chú duyệt (không bắt buộc)</Label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Nhập ghi chú…"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                disabled={actionPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAction} disabled={actionPending}>
              Hủy
            </Button>
            <Button
              variant={actionKind === "approve" ? "default" : "destructive"}
              disabled={actionPending}
              onClick={() => void handleConfirm()}
            >
              {actionPending
                ? "Đang xử lý…"
                : actionKind === "approve"
                  ? "Xác nhận duyệt"
                  : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
