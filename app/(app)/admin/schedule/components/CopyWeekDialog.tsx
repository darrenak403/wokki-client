"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCopyScheduleMutation } from "@/hooks/useSchedule";
import { addWeeksISO } from "@/lib/support/schedule/week";
import { format, parseISO } from "date-fns";

type CopyWeekDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string;
  sourceWeekStartDate: string;
  listParams: { departmentId: string; weekStartDate: string };
  onCopied: (targetWeekStartDate: string, targetScheduleId: string) => void;
};

export function CopyWeekDialog({
  open,
  onOpenChange,
  scheduleId,
  sourceWeekStartDate,
  listParams,
  onCopied,
}: CopyWeekDialogProps) {
  const [targetWeek, setTargetWeek] = useState(() => addWeeksISO(sourceWeekStartDate, 1));
  const copyMutation = useCopyScheduleMutation(scheduleId, listParams);

  const handleCopy = async () => {
    const copied = await copyMutation.mutateAsync({ targetWeekStartDate: targetWeek });
    onCopied(copied.weekStartDate, copied.id);
    onOpenChange(false);
  };

  const weekLabel = format(parseISO(targetWeek), "dd/MM/yyyy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sao chép lịch sang tuần khác</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Sao chép <strong>phân ca</strong> và <strong>đăng ký ca của nhân viên</strong> sang tuần đích
          (thứ Hai). Tuần đích luôn ở trạng thái Nháp. Nếu tuần đích đã có lịch Nháp, nội dung sẽ
          được ghi đè. Tuần đã công bố không thể ghi đè — hãy huỷ công bố trước.
        </p>
        <div className="flex items-center justify-center gap-3 py-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Tuần trước"
            onClick={() => setTargetWeek((w) => addWeeksISO(w, -1))}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium">T2 {weekLabel}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Tuần sau"
            onClick={() => setTargetWeek((w) => addWeeksISO(w, 1))}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button data-save disabled={copyMutation.isPending} onClick={() => void handleCopy()}>
            {copyMutation.isPending ? "Đang sao chép…" : "Sao chép"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
