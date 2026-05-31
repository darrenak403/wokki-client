"use client";

import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Trash2Icon } from "lucide-react";
import { SwapFeedCardShell } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapFeedCardShell";
import { SwapShiftSummary } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapShiftSummary";
import { Button } from "@/components/ui/button";
import {
  formatSwapPostRelativeTime,
  swapPostTypeAccent,
} from "@/lib/support/employee/swap-feed-utils";
import { swapPostStatusLabel, swapPostTypeLabel } from "@/lib/support/employee/swap-post-status";
import { cn } from "@/lib/utils";
import { SWAP_POST_STATUS, SWAP_POST_TYPE, type SwapPostResponse } from "@/types/employee";

type SwapMyPostCardProps = {
  post: SwapPostResponse;
  onCancel: (postId: string) => void;
  cancelPending?: boolean;
};

export function SwapMyPostCard({ post, onCancel, cancelPending }: SwapMyPostCardProps) {
  const accent = swapPostTypeAccent(post.type);
  const isCover = post.type === SWAP_POST_TYPE.Cover;

  return (
    <SwapFeedCardShell className="h-full">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", accent.badge)}>
              {swapPostTypeLabel(post.type)}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {swapPostStatusLabel(post.status)}
            </span>
          </div>
          {post.canCancel ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 shrink-0 px-2 text-muted-foreground hover:text-destructive"
              disabled={cancelPending}
              onClick={() => onCancel(post.id)}
            >
              <Trash2Icon className="size-4" />
            </Button>
          ) : null}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {formatSwapPostRelativeTime(post.createdAt)}
        </p>

        {post.note ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.note}
          </p>
        ) : null}

        <div className="mt-3 flex-1">
          <SwapShiftSummary shift={post.offeredShift} type={post.type} />
        </div>

        {post.status === SWAP_POST_STATUS.Completed && post.acceptedBy ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {isCover
              ? `Đã nhận bởi ${post.acceptedBy.displayName}`
              : `Đã đổi với ${post.acceptedBy.displayName}`}
            {post.completedAt
              ? ` · ${format(parseISO(post.completedAt), "dd/MM HH:mm", { locale: vi })}`
              : ""}
          </p>
        ) : null}
      </div>
    </SwapFeedCardShell>
  );
}
