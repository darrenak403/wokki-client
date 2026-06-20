"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon, MegaphoneIcon } from "lucide-react";
import { AcceptCoverDialog } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/AcceptCoverDialog";
import { AcceptCrossSwapDialog } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/AcceptCrossSwapDialog";
import { CreateSwapPostDialog } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/CreateSwapPostDialog";
import { SwapFeedCard } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapFeedCard";
import { SwapFeedCardList } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapFeedCardList";
import { SwapFeedComposer } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapFeedComposer";
import { SwapFeedHeader } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapFeedHeader";
import { SwapMyPostCard } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapMyPostCard";
import { NoEmployeeLinked } from "@/app/(app)/[orgId]/[locationId]/user/components/NoEmployeeLinked";
import { Button } from "@/components/ui/button";
import { useEmployeePreferenceScheduleQuery } from "@/hooks/useSchedulePreferences";
import {
  useCancelSwapPostMutation,
  useMyDraftWeekAssignmentsQuery,
  useMySwapPostsQuery,
  useSwapPostFeedQuery,
} from "@/hooks/useSwapPosts";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import { scheduleStatusLabel } from "@/lib/support/schedule/status";
import { addWeeksISO, toMondayISO } from "@/lib/support/schedule/week";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/api";
import { type SwapPostResponse, type SwapPostType } from "@/types/employee";
import { SCHEDULE_STATUS } from "@/types/schedule";

type Tab = "feed" | "mine";

function WeekPicker({
  weekLabel,
  onPrev,
  onNext,
}: {
  weekLabel: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-0.5 rounded-lg border bg-background px-0.5 py-0.5 sm:w-auto sm:justify-start">
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Tuần trước" onClick={onPrev}>
        <ChevronLeftIcon className="size-4" />
      </Button>
      <span className="min-w-0 flex-1 px-1 text-center text-sm font-medium tabular-nums sm:min-w-[8.5rem] sm:flex-none">
        {weekLabel}
      </span>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Tuần sau" onClick={onNext}>
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
}

function FeedTabs({
  tab,
  feedCount,
  mineCount,
  onChange,
}: {
  tab: Tab;
  feedCount: number;
  mineCount: number;
  onChange: (tab: Tab) => void;
}) {
  return (
    <div className="flex w-full rounded-lg border bg-muted/30 p-0.5 sm:w-auto">
      {(["feed", "mine"] as const).map((key) => (
        <button
          key={key}
          type="button"
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none",
            tab === key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onChange(key)}
        >
          {key === "feed" ? "Bảng tin" : "Bài của tôi"}
          {key === "feed" && feedCount > 0 ? ` (${feedCount})` : ""}
          {key === "mine" && mineCount > 0 ? ` (${mineCount})` : ""}
        </button>
      ))}
    </div>
  );
}

export function SwapMarketplacePanel() {
  const [weekStartDate, setWeekStartDate] = useState(() => addWeeksISO(toMondayISO(new Date()), 1));
  const [tab, setTab] = useState<Tab>("feed");
  const [createOpen, setCreateOpen] = useState(false);
  const [createInitialType, setCreateInitialType] = useState<SwapPostType | null>(null);
  const [coverPost, setCoverPost] = useState<SwapPostResponse | null>(null);
  const [crossSwapPost, setCrossSwapPost] = useState<SwapPostResponse | null>(null);

  const {
    data: preferenceSchedule,
    isLoading: scheduleLoading,
    isError: scheduleError,
    error: scheduleErr,
  } = useEmployeePreferenceScheduleQuery(weekStartDate);

  const scheduleId = preferenceSchedule?.scheduleId ?? null;
  const isDraft = preferenceSchedule?.status === SCHEDULE_STATUS.Draft;
  const marketplaceEnabled = Boolean(scheduleId && isDraft);

  const { data: draftAssignments = [] } = useMyDraftWeekAssignmentsQuery(
    marketplaceEnabled ? weekStartDate : null,
  );

  const {
    data: feedPage,
    isLoading: feedLoading,
    isError: feedError,
    error: feedErr,
  } = useSwapPostFeedQuery(scheduleId, marketplaceEnabled && tab === "feed");

  const {
    data: minePage,
    isLoading: mineLoading,
    isError: mineError,
    error: mineErr,
  } = useMySwapPostsQuery(
    { scheduleId: scheduleId ?? undefined, page: 1, pageSize: 50 },
    marketplaceEnabled,
  );

  const cancelMutation = useCancelSwapPostMutation();

  const scheduleErrorCode =
    scheduleError && scheduleErr && typeof scheduleErr === "object" && "messageCode" in scheduleErr
      ? (scheduleErr as unknown as ApiError).messageCode
      : undefined;

  const weekLabel = useMemo(() => {
    const start = parseISO(weekStartDate);
    const end = parseISO(addWeeksISO(weekStartDate, 1));
    end.setDate(end.getDate() - 1);
    return `${format(start, "dd/MM", { locale: vi })} – ${format(end, "dd/MM/yyyy", { locale: vi })}`;
  }, [weekStartDate]);

  const feedItems = feedPage?.items ?? [];
  const mineItems = minePage?.items ?? [];
  const listError = feedError
    ? mapEmployeeError(feedErr)
    : mineError
      ? mapEmployeeError(mineErr)
      : null;

  const openCreate = (initialType?: SwapPostType) => {
    setCreateInitialType(initialType ?? null);
    setCreateOpen(true);
  };

  if (scheduleErrorCode === "ME_NO_EMPLOYEE") {
    return <NoEmployeeLinked />;
  }

  const toolbar = (
    <>
      <WeekPicker
        weekLabel={weekLabel}
        onPrev={() => setWeekStartDate((current) => addWeeksISO(current, -1))}
        onNext={() => setWeekStartDate((current) => addWeeksISO(current, 1))}
      />
      {marketplaceEnabled ? (
        <FeedTabs
          tab={tab}
          feedCount={feedItems.length}
          mineCount={mineItems.length}
          onChange={setTab}
        />
      ) : null}
    </>
  );

  return (
    <div className="w-full space-y-6">
      {scheduleLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải lịch tuần…</p>
      ) : !preferenceSchedule ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Chưa có lịch Draft tuần này.
        </div>
      ) : !isDraft ? (
        <div
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
          role="status"
        >
          <MegaphoneIcon className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Lịch đã công bố</p>
            <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
              {scheduleStatusLabel(preferenceSchedule.status)} — chỉ đổi ca khi lịch còn Draft.
            </p>
          </div>
        </div>
      ) : (
        <>
          {listError ? (
            <p className="text-sm text-destructive" role="alert">
              {listError}
            </p>
          ) : null}

          {tab === "feed" ? (
            <>
              <SwapFeedHeader
                toolbar={toolbar}
                composer={<SwapFeedComposer onOpenCreate={openCreate} />}
              />

              <SwapFeedCardList
                title="Bài đăng đổi ca"
                count={feedItems.length}
                loading={feedLoading}
                empty={
                  !feedLoading && feedItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                      Chưa có bài đăng tuần này.
                    </div>
                  ) : undefined
                }
              >
                {feedItems.map((post) => (
                  <SwapFeedCard
                    key={post.id}
                    post={post}
                    onAcceptCover={setCoverPost}
                    onAcceptCrossSwap={setCrossSwapPost}
                  />
                ))}
              </SwapFeedCardList>
            </>
          ) : (
            <>
              <SwapFeedHeader toolbar={toolbar} />

              <SwapFeedCardList
                title="Bài của tôi"
                count={mineItems.length}
                loading={mineLoading}
                empty={
                  !mineLoading && mineItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                      <p>Bạn chưa đăng bài nào.</p>
                      <Button className="mt-3" variant="link" onClick={() => setTab("feed")}>
                        Về bảng tin
                      </Button>
                    </div>
                  ) : undefined
                }
              >
                {mineItems.map((post) => (
                  <SwapMyPostCard
                    key={post.id}
                    post={post}
                    cancelPending={cancelMutation.isPending}
                    onCancel={(postId) => void cancelMutation.mutateAsync(postId)}
                  />
                ))}
              </SwapFeedCardList>
            </>
          )}
        </>
      )}

      <CreateSwapPostDialog
        open={createOpen && marketplaceEnabled}
        onOpenChange={(next) => {
          if (!next) setCreateInitialType(null);
          setCreateOpen(next);
        }}
        initialType={createInitialType}
        assignments={draftAssignments}
      />

      <AcceptCoverDialog post={coverPost} onClose={() => setCoverPost(null)} />

      <AcceptCrossSwapDialog
        post={crossSwapPost}
        assignments={draftAssignments}
        onClose={() => setCrossSwapPost(null)}
      />
    </div>
  );
}
