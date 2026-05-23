"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DepartmentSelect } from "@/components/shared/department-select";
import { LocationSelect } from "@/components/shared/location-select";
import {
  useOverrideApproveSwapMutation,
  useOverrideRejectSwapMutation,
  useSwapInboxQuery,
} from "@/hooks/useSwapRequests";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import { swapStatusLabel } from "@/lib/support/employee/swap-status";
import { addWeeksISO, toMondayISO } from "@/lib/support/schedule/week";
import { SWAP_STATUS, type SwapRequestResponse } from "@/types/employee";

type ActionKind = "approve" | "reject" | null;

export function SwapInboxPanel() {
  const { session, setLocationId, setDepartmentId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;
  const [weekStartDate, setWeekStartDate] = useState(() => toMondayISO(new Date()));
  const [actionKind, setActionKind] = useState<ActionKind>(null);
  const [activeSwap, setActiveSwap] = useState<SwapRequestResponse | null>(null);
  const [note, setNote] = useState("");

  const listParams = useMemo(
    () =>
      departmentId
        ? {
            page: 1,
            pageSize: 20,
            status: SWAP_STATUS.Pending,
            departmentId,
            weekStartDate,
          }
        : null,
    [departmentId, weekStartDate]
  );

  const { data, isLoading, isError, error } = useSwapInboxQuery(
    listParams ?? { status: SWAP_STATUS.Pending },
    Boolean(listParams)
  );
  const approveMutation = useOverrideApproveSwapMutation();
  const rejectMutation = useOverrideRejectSwapMutation();

  const items = data?.items ?? [];
  const listError = isError ? mapEmployeeError(error) : null;

  const openAction = (kind: ActionKind, swap: SwapRequestResponse) => {
    setActionKind(kind);
    setActiveSwap(swap);
    setNote("");
  };

  const closeAction = () => {
    setActionKind(null);
    setActiveSwap(null);
    setNote("");
  };

  const handleConfirm = async () => {
    if (!activeSwap || !actionKind) return;
    if (actionKind === "approve") {
      await approveMutation.mutateAsync({
        swapId: activeSwap.id,
        data: { note: note.trim() || null },
      });
    } else {
      await rejectMutation.mutateAsync({
        swapId: activeSwap.id,
        data: { note: note.trim() || null },
      });
    }
    closeAction();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Chi nhánh</span>
          <LocationSelect value={locationId} onChange={setLocationId} />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Phòng ban</span>
          <DepartmentSelect
            locationId={locationId}
            value={departmentId}
            onChange={setDepartmentId}
            allowEmpty={false}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tuần (Thứ Hai)</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tuần trước"
              onClick={() => setWeekStartDate((w) => addWeeksISO(w, -1))}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="min-w-[7rem] text-center text-sm font-medium tabular-nums">
              {weekStartDate}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tuần sau"
              onClick={() => setWeekStartDate((w) => addWeeksISO(w, 1))}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {!departmentId ? (
        <p className="text-sm text-muted-foreground">Chọn phòng ban để xem inbox đổi ca.</p>
      ) : listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có yêu cầu đổi ca đang chờ.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((swap) => (
            <li key={swap.id} className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{swapStatusLabel(swap.status)}</Badge>
                <span className="text-muted-foreground text-xs">{swap.id.slice(0, 8)}…</span>
              </div>
              <p>
                Người gửi: {format(parseISO(swap.requesterShiftDate), "dd/MM")} → Đối tác:{" "}
                {format(parseISO(swap.targetShiftDate), "dd/MM")}
              </p>
              {swap.requesterNote ? (
                <p className="text-muted-foreground">“{swap.requesterNote}”</p>
              ) : null}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => openAction("approve", swap)}>
                  Duyệt thay
                </Button>
                <Button size="sm" variant="outline" onClick={() => openAction("reject", swap)}>
                  Từ chối
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={actionKind !== null} onOpenChange={(open) => !open && closeAction()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionKind === "approve" ? "Duyệt đổi ca thay" : "Từ chối đổi ca"}
            </DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Ghi chú (tùy chọn)</FieldLabel>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={closeAction}>
              Hủy
            </Button>
            <Button
              disabled={approveMutation.isPending || rejectMutation.isPending}
              onClick={() => void handleConfirm()}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
