"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useBedrockAiAvailable } from "@/hooks/useBedrockAiAvailable";
import {
  useApplySuggestionsMutation,
  useSuggestScheduleMutation,
} from "@/hooks/useSchedule";
import { mapSuggestReason } from "@/lib/support/schedule/suggest-reasons";
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
  const { aiAvailable, isFetching: bedrockChecking } = useBedrockAiAvailable(open);

  const [useAi, setUseAi] = useState(false);
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [reason, setReason] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);

  const resetSheetState = () => {
    setSuggestions([]);
    setReason(null);
    setProvider(null);
    setFallbackUsed(false);
    setSelected(new Set());
    setHasGenerated(false);
    setUseAi(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetSheetState();
    onOpenChange(next);
  };

  const handleGenerate = async () => {
    const data = await suggestMutation.mutateAsync({ useAi: useAi && aiAvailable });
    setSuggestions(data.suggestions);
    setReason(data.reason);
    setProvider(data.provider);
    setFallbackUsed(data.fallbackUsed);
    setSelected(new Set(data.suggestions.map((s) => s.id)));
    setHasGenerated(true);
    if (data.fallbackUsed) {
      toast.message("AI không khả dụng, đã dùng gợi ý cơ bản.");
    }
  };

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
    handleOpenChange(false);
  };

  const loading = suggestMutation.isPending;
  const empty = hasGenerated && !loading && suggestions.length === 0;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Gợi ý phân ca</SheetTitle>
          <SheetDescription>
            Nhấn Tạo gợi ý để xem trước, chọn dòng cần áp dụng vào lịch Nháp.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 border-b pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label htmlFor="use-ai-suggest">Dùng AI (Bedrock)</Label>
              <p className="text-xs text-muted-foreground">
                {bedrockChecking
                  ? "Đang kiểm tra Bedrock…"
                  : aiAvailable
                    ? "AI sẵn sàng khi bật."
                    : "AI tạm không khả dụng — chỉ gợi ý cơ bản."}
              </p>
            </div>
            <Switch
              id="use-ai-suggest"
              checked={useAi}
              disabled={!aiAvailable || bedrockChecking}
              onCheckedChange={setUseAi}
            />
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={loading || bedrockChecking}
            onClick={() => void handleGenerate()}
          >
            {loading ? "Đang tạo gợi ý…" : "Tạo gợi ý"}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {!hasGenerated ? (
            <p className="text-sm text-muted-foreground">
              Chọn tuỳ chọn AI (nếu có) rồi nhấn Tạo gợi ý.
            </p>
          ) : loading ? (
            <p className="text-sm text-muted-foreground">Đang tạo gợi ý…</p>
          ) : empty ? (
            <p className="text-sm text-muted-foreground">{mapSuggestReason(reason)}</p>
          ) : (
            <>
              {provider ? (
                <p className="mb-3 text-xs text-muted-foreground">
                  Nguồn: {provider === "bedrock" ? "Bedrock AI" : "Heuristic"}
                  {fallbackUsed ? " (đã fallback)" : ""}
                </p>
              ) : null}
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
            </>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Đóng
          </Button>
          <Button
            disabled={!hasGenerated || empty || selected.size === 0 || applyMutation.isPending}
            onClick={() => void handleApply()}
          >
            {applyMutation.isPending ? "Đang áp dụng…" : `Áp dụng (${selected.size})`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
