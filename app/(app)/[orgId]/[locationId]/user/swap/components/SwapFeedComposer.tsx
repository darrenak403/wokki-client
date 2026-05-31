"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMyProfileQuery } from "@/hooks/useMyProfile";
import { initialsFromDisplayName } from "@/lib/support/employee/swap-feed-utils";

type SwapFeedComposerProps = {
  onOpenCreate: () => void;
};

export function SwapFeedComposer({ onOpenCreate }: SwapFeedComposerProps) {
  const { data: profile } = useMyProfileQuery();
  const displayName =
    profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Bạn";

  return (
    <div className="flex gap-3">
      <Avatar size="lg" className="bg-[#EEF6FB] text-sm font-semibold text-[#1D4D8F]">
        <AvatarFallback>{initialsFromDisplayName(displayName)}</AvatarFallback>
      </Avatar>
      <button
        type="button"
        className="flex h-11 flex-1 items-center rounded-full bg-muted/60 px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
        onClick={onOpenCreate}
      >
        Đăng ca nhường hoặc đổi chéo…
      </button>
    </div>
  );
}
