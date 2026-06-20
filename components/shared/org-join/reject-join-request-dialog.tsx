"use client";

import { useState } from "react";
import { useRejectOrgJoinMutation } from "@/hooks/useOrgJoin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { PendingOrgJoinRequestResponse } from "@/types/org-join";

type RejectJoinRequestDialogProps = {
  target: PendingOrgJoinRequestResponse | null;
  onClose: () => void;
};

export function RejectJoinRequestDialog({ target, onClose }: RejectJoinRequestDialogProps) {
  const rejectMutation = useRejectOrgJoinMutation();
  const [note, setNote] = useState("");

  const onReject = async () => {
    if (!target) return;
    const result = await rejectMutation.mutateAsync({
      id: target.id,
      data: { note: note.trim() || null },
    });
    if (result.success) {
      setNote("");
      onClose();
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Từ chối yêu cầu?</DialogTitle>
          <DialogDescription>
            {target ? `${target.firstName} ${target.lastName} (${target.email})` : null}
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel>Lý do (tùy chọn)</FieldLabel>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            placeholder="Ghi chú gửi cho ứng viên…"
            rows={3}
          />
        </Field>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={rejectMutation.isPending}
            onClick={() => void onReject()}
          >
            Từ chối
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
