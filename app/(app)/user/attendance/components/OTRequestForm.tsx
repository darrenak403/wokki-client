"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubmitOTRequestMutation } from "@/hooks/useOvertimeRequests";

interface OTRequestFormProps {
  shiftAssignmentId: string;
  onSuccess?: () => void;
}

export function OTRequestForm({ shiftAssignmentId, onSuccess }: OTRequestFormProps) {
  const [reason, setReason] = useState("");
  const mutation = useSubmitOTRequestMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await mutation.mutateAsync({ shiftAssignmentId, reason: reason.trim() });
    onSuccess?.();
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="rounded-lg border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-base">Yêu cầu tăng ca</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ca đã kết thúc. Nhập lý do để tiếp tục làm và tính giờ tăng ca.
        </p>
      </div>
      <textarea
        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        placeholder="Lý do tăng ca…"
        maxLength={500}
        required
        value={reason}
        disabled={mutation.isPending}
        onChange={(e) => setReason(e.target.value)}
      />
      {mutation.isError ? (
        <p className="text-sm text-destructive">{String(mutation.error)}</p>
      ) : null}
      <Button type="submit" disabled={mutation.isPending || !reason.trim()}>
        {mutation.isPending ? "Đang gửi…" : "Gửi yêu cầu tăng ca"}
      </Button>
    </form>
  );
}
