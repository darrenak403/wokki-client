"use client";

import { useMemo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { fetchSwapPosts } from "@/lib/api/services/fetchSwapPosts";
import { useAcceptSwapPostMutation } from "@/hooks/useSwapPosts";
import { formatSwapShiftLine } from "@/lib/support/employee/swap-post-status";
import type { SwapPostResponse } from "@/types/employee";
import type { ShiftAssignmentResponse } from "@/types/schedule";

type AcceptCrossSwapDialogProps = {
  post: SwapPostResponse | null;
  assignments: ShiftAssignmentResponse[];
  onClose: () => void;
};

export function AcceptCrossSwapDialog({
  post,
  assignments,
  onClose,
}: AcceptCrossSwapDialogProps) {
  const acceptMutation = useAcceptSwapPostMutation();
  const [assignmentId, setAssignmentId] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const mySwapCandidates = useMemo(() => {
    if (!post) return assignments;
    return assignments.filter((a) => a.id !== post.offeredShift.assignmentId);
  }, [assignments, post]);

  useEffect(() => {
    if (!post) {
      setAssignmentId("");
      setPreviewError(null);
    }
  }, [post]);

  useEffect(() => {
    if (!post || !assignmentId) {
      setPreviewError(null);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        setPreviewLoading(true);
        try {
          const result = await fetchSwapPosts.previewAccept(post.id, {
            acceptorAssignmentId: assignmentId,
          });
          if (cancelled) return;
          setPreviewError(result.isValid ? null : (result.errorMessage ?? "Không thể đổi ca."));
        } catch {
          if (!cancelled) setPreviewError(null);
        } finally {
          if (!cancelled) setPreviewLoading(false);
        }
      })();
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [post, assignmentId]);

  const handleAccept = async () => {
    if (!post || !assignmentId) return;
    await acceptMutation.mutateAsync({
      postId: post.id,
      data: { acceptorAssignmentId: assignmentId },
    });
    onClose();
  };

  const offeredLine = post
    ? formatSwapShiftLine(
        post.offeredShift.shiftName,
        post.offeredShift.startTime,
        post.offeredShift.endTime,
        post.offeredShift.date,
      )
    : "";

  return (
    <Dialog open={Boolean(post)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi chéo với {post?.author.displayName}</DialogTitle>
        </DialogHeader>

        {post ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ca họ muốn đổi: <span className="font-medium text-foreground">{offeredLine}</span>
            </p>
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              Chọn <strong>ca của bạn</strong> để hoán đổi với ca trên. Nhường ca thì không cần bước
              này.
            </p>

            <FieldGroup>
              <Field>
                <FieldLabel>Ca của bạn (để đổi)</FieldLabel>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={assignmentId}
                  onChange={(event) => setAssignmentId(event.target.value)}
                  aria-label="Chọn ca của bạn để đổi"
                >
                  <option value="">Chọn ca trên lịch Draft</option>
                  {mySwapCandidates.map((assignment) => (
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
            </FieldGroup>

            {mySwapCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bạn chưa có ca nào khác trên lịch Draft để đổi.</p>
            ) : null}

            {previewError ? (
              <p className="text-sm text-destructive" role="alert">
                {previewError}
              </p>
            ) : assignmentId && previewLoading ? (
              <p className="text-sm text-muted-foreground">Đang kiểm tra…</p>
            ) : assignmentId && !previewError ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Có thể đổi ca.</p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={
              !post ||
              !assignmentId ||
              Boolean(previewError) ||
              acceptMutation.isPending ||
              previewLoading
            }
            onClick={() => void handleAccept()}
          >
            {acceptMutation.isPending ? "Đang đổi…" : "Xác nhận đổi ca"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
