"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useCreateSwapPostMutation } from "@/hooks/useSwapPosts";
import { formatSwapShiftLine, swapPostTypeHint } from "@/lib/support/employee/swap-post-status";
import { SWAP_POST_TYPE, type SwapPostType } from "@/types/employee";
import type { ShiftAssignmentResponse } from "@/types/schedule";

type CreateSwapPostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: SwapPostType | null;
  assignments: ShiftAssignmentResponse[];
};

export function CreateSwapPostDialog({
  open,
  onOpenChange,
  initialType,
  assignments,
}: CreateSwapPostDialogProps) {
  const createMutation = useCreateSwapPostMutation();
  const [type, setType] = useState<SwapPostType>(SWAP_POST_TYPE.Cover);
  const [assignmentId, setAssignmentId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && initialType != null) {
      setType(initialType);
    }
  }, [open, initialType]);

  const reset = () => {
    setType(initialType ?? SWAP_POST_TYPE.Cover);
    setAssignmentId("");
    setNote("");
  };

  const handleSubmit = async () => {
    if (!assignmentId) return;
    await createMutation.mutateAsync({
      authorAssignmentId: assignmentId,
      type,
      note: note.trim() || null,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đăng bài đổi ca</DialogTitle>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel>Loại bài</FieldLabel>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={type}
              onChange={(event) => setType(Number(event.target.value) as SwapPostType)}
              aria-label="Loại bài đổi ca"
            >
              <option value={SWAP_POST_TYPE.Cover}>Nhường ca</option>
              <option value={SWAP_POST_TYPE.CrossSwap}>Đổi chéo</option>
            </select>
            <p className="mt-2 text-sm text-muted-foreground">{swapPostTypeHint(type)}</p>
          </Field>

          <Field>
            <FieldLabel>Ca bạn muốn nhường / đổi</FieldLabel>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={assignmentId}
              onChange={(event) => setAssignmentId(event.target.value)}
              aria-label="Chọn ca của bạn"
            >
              <option value="">Chọn ca trên lịch Draft</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {formatSwapShiftLine(
                    assignment.shiftName,
                    assignment.startTime,
                    assignment.endTime,
                    assignment.date,
                  )}
                </option>
              ))}
            </select>
          </Field>

          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có phân ca Draft. Admin/Manager cần xếp lịch trước khi đăng bài.
            </p>
          ) : null}

          <Field>
            <FieldLabel>Ghi chú (tuỳ chọn)</FieldLabel>
            <textarea
              className="min-h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="VD: Ai rảnh nhận giúp em ca này..."
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button
            disabled={!assignmentId || createMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {createMutation.isPending ? "Đang đăng…" : "Đăng bài"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
