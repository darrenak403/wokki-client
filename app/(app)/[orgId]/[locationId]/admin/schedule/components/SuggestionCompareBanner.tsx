"use client";

import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SuggestionCompareStats } from "@/lib/support/schedule/suggestion-compare";

type SuggestionCompareBannerProps = {
  stats: SuggestionCompareStats;
};

export function SuggestionCompareBanner({ stats }: SuggestionCompareBannerProps) {
  if (!stats.hasCurrentSchedule) return null;

  return (
    <div className="shrink-0 border-b bg-muted/30 px-4 py-2.5 sm:px-5">
      <p className="text-xs font-medium text-foreground">So sánh với lịch nháp hiện tại</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
        {stats.changed > 0 ? (
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {stats.changed} đổi người
          </Badge>
        ) : null}
        {stats.new > 0 ? (
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            {stats.new} ô mới
          </Badge>
        ) : null}
        {stats.unchanged > 0 ? (
          <Badge variant="secondary">{stats.unchanged} giữ nguyên</Badge>
        ) : null}
        {stats.cleared > 0 ? (
          <Badge variant="outline" className="text-muted-foreground">
            {stats.cleared} ô không còn gợi ý
          </Badge>
        ) : null}
        <span className="text-muted-foreground">
          Áp dụng sẽ đè lịch cũ tại các ô đã chọn
          {stats.cleared > 0 ? ` · ${stats.cleared} ô cũ không còn gợi ý sẽ được xóa` : ""}
        </span>
      </div>
    </div>
  );
}

type SuggestionDiffChipProps = {
  diff: "new" | "unchanged" | "changed";
  employeeName: string;
  previousName?: string;
  selected: boolean;
};

export function SuggestionDiffChip({
  diff,
  employeeName,
  previousName,
  selected,
}: SuggestionDiffChipProps) {
  return (
    <div className="min-w-0 flex-1">
      {diff === "changed" && previousName ? (
        <div className="flex min-w-0 items-center gap-1 text-[10px] text-amber-800/90 dark:text-amber-200/90">
          <span className="truncate line-through opacity-70">{previousName}</span>
          <ArrowRightIcon className="size-3 shrink-0" aria-hidden />
        </div>
      ) : null}
      <span
        className={
          selected
            ? "truncate text-xs font-semibold"
            : "truncate text-xs font-semibold opacity-70"
        }
      >
        {employeeName}
      </span>
      {diff === "new" ? (
        <span className="mt-0.5 block text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
          Mới
        </span>
      ) : null}
      {diff === "changed" ? (
        <span className="mt-0.5 block text-[10px] font-medium text-amber-700 dark:text-amber-300">
          Đổi
        </span>
      ) : null}
    </div>
  );
}
