"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowRightIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarEmptySlot,
  WeekShiftCalendar,
  type WeekShiftCalendarShift,
} from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/WeekShiftCalendar";
import { shiftAccentColor, shiftChipStyle } from "@/lib/support/schedule/shift-calendar";
import {
  listMaterialChanges,
  slotEntriesByKey,
  type SlotCompareEntry,
  type SuggestionCompareStats,
} from "@/lib/support/schedule/suggestion-compare";
import { cn } from "@/lib/utils";

type SuggestionDiffViewProps = {
  days: string[];
  shifts: WeekShiftCalendarShift[];
  slotEntries: SlotCompareEntry[];
  stats: SuggestionCompareStats;
  selected: Set<string>;
  onToggle: (suggestionId: string, checked: boolean) => void;
  onSelectChangesOnly: () => void;
  onSelectAll: () => void;
};

function formatDayLabel(date: string) {
  const parsed = parseISO(date);
  return `${format(parsed, "EEE", { locale: vi })} ${format(parsed, "dd/MM")}`;
}

function ChangeListItem({ entry }: { entry: SlotCompareEntry }) {
  const day = formatDayLabel(entry.date);

  if (entry.kind === "cleared") {
    return (
      <li className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/90 px-3 py-2 text-xs dark:border-rose-900 dark:bg-rose-950/30">
        <MinusIcon className="size-3.5 shrink-0 text-rose-600" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="font-medium text-rose-900 dark:text-rose-200">
            {day} · {entry.shiftName}
          </span>
          <span className="text-rose-700/90 dark:text-rose-300/90">
            {" "}
            — bỏ <span className="line-through">{entry.previousName}</span> (tự xóa khi áp dụng)
          </span>
        </span>
      </li>
    );
  }

  if (entry.kind === "changed" && entry.suggestion) {
    return (
      <li className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs dark:border-amber-900 dark:bg-amber-950/30">
        <ArrowRightIcon className="size-3.5 shrink-0 text-amber-700" aria-hidden />
        <span className="min-w-0 flex-1 font-medium text-amber-950 dark:text-amber-100">
          {day} · {entry.shiftName}:{" "}
          <span className="line-through opacity-70">{entry.previousName}</span>
          {" → "}
          {entry.suggestion.employeeName}
        </span>
      </li>
    );
  }

  if (entry.kind === "new" && entry.suggestion) {
    return (
      <li className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-xs dark:border-emerald-900 dark:bg-emerald-950/30">
        <PlusIcon className="size-3.5 shrink-0 text-emerald-700" aria-hidden />
        <span className="min-w-0 flex-1 font-medium text-emerald-950 dark:text-emerald-100">
          {day} · {entry.shiftName}: thêm {entry.suggestion.employeeName}
        </span>
      </li>
    );
  }

  return null;
}

export function SuggestionDiffView({
  days,
  shifts,
  slotEntries,
  stats,
  selected,
  onToggle,
  onSelectChangesOnly,
  onSelectAll,
}: SuggestionDiffViewProps) {
  const [showFullGrid, setShowFullGrid] = useState(false);
  const entriesByKey = useMemo(() => slotEntriesByKey(slotEntries), [slotEntries]);
  const materialChanges = useMemo(() => listMaterialChanges(slotEntries), [slotEntries]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {stats.changed > 0 ? (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
              {stats.changed} đổi người
            </Badge>
          ) : null}
          {stats.cleared > 0 ? (
            <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-900">
              {stats.cleared} bỏ ca
            </Badge>
          ) : null}
          {stats.new > 0 ? (
            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900">
              {stats.new} thêm mới
            </Badge>
          ) : null}
          <Badge variant="secondary">{stats.unchanged} giữ nguyên</Badge>
        </div>

        {stats.cleared > 0 ? (
          <p className="text-xs text-muted-foreground">
            {stats.cleared} ô cũ không còn trong gợi ý — sẽ tự xóa khi áp dụng (giữ chọn các gợi ý còn lại).
          </p>
        ) : null}

        {materialChanges.length > 0 ? (
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
              <p className="text-xs font-semibold">
                Thay đổi cần xem ({materialChanges.length})
              </p>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={onSelectChangesOnly}>
                  Chỉ chọn thay đổi
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={onSelectAll}>
                  Chọn tất cả
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-[140px]">
              <ul className="space-y-1.5 p-2">
                {materialChanges.map((entry) => (
                  <ChangeListItem key={entry.key} entry={entry} />
                ))}
              </ul>
            </ScrollArea>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
            Gợi ý mới giống lịch đã phân — áp dụng sẽ giữ nguyên phân ca hiện tại.
          </p>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {showFullGrid
              ? "Lưới đầy đủ — ô vàng/đỏ = khác lịch cũ"
              : "Chỉ hiện ô có thay đổi trên lưới"}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowFullGrid((value) => !value)}
          >
            {showFullGrid ? "Thu gọn lưới" : "Xem lưới đầy đủ"}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto">
          <WeekShiftCalendar
            fillHeight
            className="min-w-[880px]"
            days={days}
            shifts={shifts}
            renderCell={(shift, date) => {
              const entry = entriesByKey.get(`${shift.id}|${date}`);
              if (!entry) return <CalendarEmptySlot />;

              if (!showFullGrid && (entry.kind === "unchanged" || entry.kind === "empty")) {
                return (
                  <div className="flex min-h-[48px] items-center justify-center text-[10px] text-muted-foreground/40">
                    —
                  </div>
                );
              }

              const color = shiftAccentColor(shift.color);

              if (entry.kind === "empty") {
                return <CalendarEmptySlot label="Trống" />;
              }

              if (entry.kind === "cleared") {
                return (
                  <div className="rounded-lg border border-rose-200 bg-rose-50/90 px-2.5 py-2 dark:border-rose-900 dark:bg-rose-950/40">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                      Bỏ ca
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium line-through opacity-80">
                      {entry.previousName}
                    </p>
                  </div>
                );
              }

              if (!entry.suggestion) return <CalendarEmptySlot />;

              const suggestion = entry.suggestion;
              const isSelected = selected.has(suggestion.id);
              const diff = entry.kind;

              return (
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 transition-all",
                    !isSelected && "opacity-50",
                    diff === "changed" && "ring-2 ring-amber-400/70",
                    diff === "new" && "ring-2 ring-emerald-400/60",
                    diff === "unchanged" && "border-dashed opacity-80",
                  )}
                  style={diff === "unchanged" ? undefined : shiftChipStyle(color)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onToggle(suggestion.id, checked === true)}
                    aria-label={`Chọn ${suggestion.employeeName}`}
                    className="mt-0.5 size-3.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    {diff === "changed" && entry.previousName ? (
                      <p className="truncate text-[10px] line-through opacity-70">
                        {entry.previousName}
                      </p>
                    ) : null}
                    <p className="truncate text-xs font-semibold leading-tight">
                      {suggestion.employeeName}
                    </p>
                    {diff === "unchanged" ? (
                      <p className="text-[10px] text-muted-foreground">Giữ nguyên</p>
                    ) : null}
                  </div>
                </label>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
