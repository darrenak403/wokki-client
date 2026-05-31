"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useApproveLeaveRequestMutation,
  useLeaveRequestsReviewQuery,
  useRejectLeaveRequestMutation,
} from "@/hooks/useScheduleLeaveRequests";
import { weekDayDates } from "@/lib/support/schedule/week";

type LeaveRequestsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string;
  weekStartDate: string;
};

export function LeaveRequestsDialog({
  open,
  onOpenChange,
  scheduleId,
  weekStartDate,
}: LeaveRequestsDialogProps) {
  const { data: pending = [], isLoading } = useLeaveRequestsReviewQuery(
    open ? scheduleId : null,
    "Pending",
  );
  const approveMutation = useApproveLeaveRequestMutation(scheduleId);
  const rejectMutation = useRejectLeaveRequestMutation(scheduleId);
  const [actingId, setActingId] = useState<string | null>(null);

  const weekDates = useMemo(() => weekDayDates(weekStartDate), [weekStartDate]);
  const dateLabels = useMemo(
    () =>
      Object.fromEntries(
        weekDates.map((d) => [d, format(parseISO(d), "dd/MM")]),
      ),
    [weekDates],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Duyệt xin nghỉ</DialogTitle>
          <DialogDescription>
            Duyệt sẽ ghi Unavailable và gỡ phân ca trùng (nếu có). Admin tạo gợi ý AI lại sau.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có đơn chờ duyệt.</p>
        ) : (
          <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {pending.map((item) => (
              <li key={item.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{item.employeeName}</p>
                <p className="text-muted-foreground">
                  {item.shiftName} · {dateLabels[item.date] ?? item.date}
                </p>
                <p className="mt-1 text-muted-foreground">{item.reason}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    disabled={actingId === item.id}
                    onClick={() => {
                      setActingId(item.id);
                      void approveMutation.mutateAsync(item.id).finally(() => setActingId(null));
                    }}
                  >
                    Duyệt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actingId === item.id}
                    onClick={() => {
                      setActingId(item.id);
                      void rejectMutation.mutateAsync(item.id).finally(() => setActingId(null));
                    }}
                  >
                    Từ chối
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
