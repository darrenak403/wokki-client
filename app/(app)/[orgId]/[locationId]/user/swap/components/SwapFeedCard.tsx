"use client";

import { ArrowLeftRightIcon, HandHeartIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SwapFeedCardShell } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapFeedCardShell";
import { SwapShiftSummary } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapShiftSummary";
import {
  formatSwapPostRelativeTime,
  initialsFromDisplayName,
  swapPostTypeAccent,
} from "@/lib/support/employee/swap-feed-utils";
import { swapPostTypeLabel } from "@/lib/support/employee/swap-post-status";
import { cn } from "@/lib/utils";
import { SWAP_POST_TYPE, type SwapPostResponse } from "@/types/employee";

type SwapFeedCardProps = {
  post: SwapPostResponse;
  onAcceptCover: (post: SwapPostResponse) => void;
  onAcceptCrossSwap: (post: SwapPostResponse) => void;
};

export function SwapFeedCard({
  post,
  onAcceptCover,
  onAcceptCrossSwap,
}: SwapFeedCardProps) {
  const isCover = post.type === SWAP_POST_TYPE.Cover;
  const accent = swapPostTypeAccent(post.type);

  return (
    <SwapFeedCardShell className="h-full">
      <div className="flex flex-1 flex-col p-4">
        <header className="flex gap-3">
          <Avatar size="lg" className="bg-muted text-sm font-semibold">
            <AvatarFallback>{initialsFromDisplayName(post.author.displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate font-semibold">{post.author.displayName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", accent.badge)}>
                {swapPostTypeLabel(post.type)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatSwapPostRelativeTime(post.createdAt)}
              </span>
            </div>
          </div>
        </header>

        {post.note ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed">{post.note}</p>
        ) : null}

        <div className="mt-3 flex-1">
          <SwapShiftSummary shift={post.offeredShift} type={post.type} />
        </div>
      </div>

      {post.canAccept ? (
        <div className="border-t">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-11 w-full rounded-none text-sm font-semibold",
              accent.action,
            )}
            title={
              isCover
                ? "Nhận nếu lịch bạn còn trống — không cần đổi ca của bạn"
                : "Chọn ca của bạn để hoán đổi"
            }
            onClick={() => (isCover ? onAcceptCover(post) : onAcceptCrossSwap(post))}
          >
            {isCover ? (
              <>
                <HandHeartIcon className="size-4" />
                Nhận ca
              </>
            ) : (
              <>
                <ArrowLeftRightIcon className="size-4" />
                Đổi với tôi
              </>
            )}
          </Button>
        </div>
      ) : null}
    </SwapFeedCardShell>
  );
}
