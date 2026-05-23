"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useApplySuggestionsMutation,
  useSuggestScheduleMutation,
} from "@/hooks/useSchedule";
import { format, parseISO } from "date-fns";
import type { ScheduleSuggestion } from "@/types/schedule";

type SuggestionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string;
  listParams: { departmentId: string; weekStartDate: string };
};

export function SuggestionsSheet({
  open,
  onOpenChange,
  scheduleId,
  listParams,
}: SuggestionsSheetProps) {
  const suggestMutation = useSuggestScheduleMutation(scheduleId);
  const applyMutation = useApplySuggestionsMutation(scheduleId, listParams);
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [reason, setReason] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    void suggestMutation.mutateAsync().then((data) => {
      setSuggestions(data.suggestions);
      setReason(data.reason);
      setSelected(new Set(data.suggestions.map((s) => s.id)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when sheet opens
  }, [open]);

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleApply = async () => {
    const picked = suggestions.filter((s) => selected.has(s.id));
    if (picked.length === 0) return;
    await applyMutation.mutateAsync({
      suggestions: picked.map((s) => ({
        shiftDefinitionId: s.shiftDefinitionId,
        employeeId: s.employeeId,
        date: s.date,
        note: null,
      })),
    });
    onOpenChange(false);
  };

  const loading = suggestMutation.isPending;
  const empty = !loading && suggestions.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Gợi ý phân ca</SheetTitle>
          <SheetDescription>
            Xem trước gợi ý từ hệ thống, chọn dòng cần áp dụng vào lịch Nháp.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Đang tạo gợi ý…</p>
          ) : empty ? (
            <p className="text-sm text-muted-foreground">
              {reason ?? "Không có gợi ý phù hợp cho tuần này."}
            </p>
          ) : (
            <ul className="space-y-3">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                >
                  <Checkbox
                    checked={selected.has(s.id)}
                    onCheckedChange={(c) => toggle(s.id, c === true)}
                    aria-label={`Chọn gợi ý ${s.employeeName}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {s.employeeName} — {s.shiftName}
                    </p>
                    <p className="text-muted-foreground">
                      {format(parseISO(s.date), "dd/MM/yyyy")} · Điểm {s.score}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            disabled={empty || selected.size === 0 || applyMutation.isPending}
            onClick={() => void handleApply()}
          >
            {applyMutation.isPending ? "Đang áp dụng…" : `Áp dụng (${selected.size})`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
