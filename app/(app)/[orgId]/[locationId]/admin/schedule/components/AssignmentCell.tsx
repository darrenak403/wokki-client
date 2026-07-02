"use client";

import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteAssignmentMutation } from "@/hooks/useSchedule";
import type { ShiftAssignmentResponse } from "@/types/schedule";

type AssignmentCellProps = {
  assignments: ShiftAssignmentResponse[];
  scheduleId: string;
  listParams: { departmentId: string; weekStartDate: string };
  editable: boolean;
  employeeNameById: Map<string, string>;
  onAdd: () => void;
};

export function AssignmentCell({
  assignments,
  scheduleId,
  listParams,
  editable,
  employeeNameById,
  onAdd,
}: AssignmentCellProps) {
  const deleteMutation = useDeleteAssignmentMutation(scheduleId, listParams);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    await deleteMutation.mutateAsync(pendingDeleteId);
    setPendingDeleteId(null);
  };

  if (assignments.length === 0) {
    if (!editable) {
      return <span className="text-xs text-muted-foreground">—</span>;
    }
    return (
      <button
        type="button"
        className="min-h-10 w-full rounded-md border border-dashed border-muted-foreground/30 px-1 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
        onClick={onAdd}
      >
        + Phân ca
      </button>
    );
  }

  return (
    <div className="flex min-h-10 flex-col gap-1">
      {assignments.map((a) => (
        <div
          key={a.id}
          className="flex items-start justify-between gap-1 rounded-md bg-muted/50 px-1.5 py-1 text-xs"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">
              {employeeNameById.get(a.employeeId) ?? a.shiftName}
            </p>
            {a.note ? <p className="text-muted-foreground truncate">{a.note}</p> : null}
          </div>
          {editable ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="shrink-0"
              aria-label="Xóa phân ca"
              disabled={deleteMutation.isPending}
              onClick={() => setPendingDeleteId(a.id)}
            >
              <Trash2Icon className="size-3" />
            </Button>
          ) : null}
        </div>
      ))}
      {editable ? (
        <button
          type="button"
          className="text-left text-xs text-primary hover:underline"
          onClick={onAdd}
        >
          + Thêm
        </button>
      ) : null}

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phân ca này?</AlertDialogTitle>
            <AlertDialogDescription>
              Nhân viên sẽ không còn được phân vào ca này trong lịch nháp. Bạn có thể phân lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => void confirmDelete()}
            >
              {deleteMutation.isPending ? "Đang xoá…" : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
