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
import { fetchSwapPosts } from "@/lib/api/services/fetchSwapPosts";
import { useAcceptSwapPostMutation } from "@/hooks/useSwapPosts";
import { formatSwapShiftLine } from "@/lib/support/employee/swap-post-status";
import type { SwapPostResponse } from "@/types/employee";

type AcceptCoverDialogProps = {
  post: SwapPostResponse | null;
  onClose: () => void;
};

export function AcceptCoverDialog({ post, onClose }: AcceptCoverDialogProps) {
  const acceptMutation = useAcceptSwapPostMutation();
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [canAccept, setCanAccept] = useState(false);

  useEffect(() => {
    if (!post) {
      setPreviewError(null);
      setCanAccept(false);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    setCanAccept(false);

    void (async () => {
      try {
        const result = await fetchSwapPosts.previewAccept(post.id, {});
        if (cancelled) return;
        if (result.isValid) {
          setCanAccept(true);
          setPreviewError(null);
        } else {
          setCanAccept(false);
          setPreviewError(result.errorMessage ?? "Bạn không còn chỗ trống để nhận ca này.");
        }
      } catch {
        if (!cancelled) setPreviewError(null);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [post]);

  const handleAccept = async () => {
    if (!post) return;
    await acceptMutation.mutateAsync({ postId: post.id });
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
          <DialogTitle>Nhận ca từ {post?.author.displayName}</DialogTitle>
        </DialogHeader>

        {post ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ca nhường: <span className="font-medium text-foreground">{offeredLine}</span>
            </p>
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              Bạn chỉ nhận ca này nếu lịch còn <strong>chỗ trống</strong> (không trùng ca khác). Không
              cần chọn ca của bạn để đổi.
            </p>

            {previewLoading ? (
              <p className="text-sm text-muted-foreground">Đang kiểm tra lịch của bạn…</p>
            ) : previewError ? (
              <p className="text-sm text-destructive" role="alert">
                {previewError}
              </p>
            ) : canAccept ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Lịch của bạn còn trống — có thể nhận ca.
              </p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!post || !canAccept || Boolean(previewError) || acceptMutation.isPending || previewLoading}
            onClick={() => void handleAccept()}
          >
            {acceptMutation.isPending ? "Đang nhận…" : "Xác nhận nhận ca"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
