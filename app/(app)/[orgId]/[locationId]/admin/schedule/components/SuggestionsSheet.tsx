"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bot,
  CheckCheck,
  Loader2,
  SendHorizontal,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarEmptySlot,
  WeekShiftCalendar,
  type WeekShiftCalendarShift,
} from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/WeekShiftCalendar";
import { ScheduleGrid } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/ScheduleGrid";
import { SuggestionDiffView } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/SuggestionDiffView";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { buildSuggestionCompare } from "@/lib/support/schedule/suggestion-compare";
import {
  useApplySuggestionsMutation,
  useScheduleInsightChatMutation,
  useScheduleInsightContextQuery,
  useSuggestScheduleMutation,
} from "@/hooks/useSchedule";
import { useShiftsQuery } from "@/hooks/useShifts";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import { useAuth } from "@/hooks/useAuth";
import { isAppRole, ROLE_ADMIN } from "@/lib/types/roles";
import { mapSuggestReason } from "@/lib/support/schedule/suggest-reasons";
import { buildReadinessLine } from "@/lib/support/schedule/suggest-readiness";
import { shiftAccentColor, shiftChipStyle } from "@/lib/support/schedule/shift-calendar";
import { weekDayDates } from "@/lib/support/schedule/week";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { ScheduleStatus, ScheduleSuggestion, ShiftAssignmentResponse } from "@/types/schedule";

function timeToMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.slice(0, 5).split(":");
  return Number(hours) * 60 + Number(minutes);
}

type SuggestionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string;
  locationId: string;
  listParams: { departmentId: string; weekStartDate: string };
  status: ScheduleStatus;
  conflictCount?: number;
  currentAssignments?: ShiftAssignmentResponse[];
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function SuggestionsSheet({
  open,
  onOpenChange,
  scheduleId,
  locationId,
  listParams,
  status,
  conflictCount = 0,
  currentAssignments = [],
}: SuggestionsSheetProps) {
  const router = useRouter();
  const { branchPath, orgPath, parsed } = useTenantNavigation();
  const { role } = useAuth();
  const suggestMutation = useSuggestScheduleMutation(scheduleId);
  const applyMutation = useApplySuggestionsMutation(scheduleId, listParams);
  const contextQuery = useScheduleInsightContextQuery(scheduleId, open);
  const chatMutation = useScheduleInsightChatMutation(scheduleId);

  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [reason, setReason] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const resetSheetState = () => {
    setSuggestions([]);
    setReason(null);
    setFallbackUsed(false);
    setSelected(new Set());
    setHasGenerated(false);
    setQuestion("");
    setMessages([]);
    setAssistantOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetSheetState();
    onOpenChange(next);
  };

  const handleGenerate = async () => {
    try {
      const data = await suggestMutation.mutateAsync({ useAi: false });
      setSuggestions(data.suggestions);
      setReason(data.reason);
      setFallbackUsed(data.fallbackUsed);
      setSelected(new Set(data.suggestions.map((s) => s.id)));
      setHasGenerated(true);
      await contextQuery.refetch();
    } catch {
      resetSheetState();
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

  const selectAll = () => setSelected(new Set(suggestions.map((s) => s.id)));
  const selectNone = () => setSelected(new Set());
  const selectChangesOnly = () => {
    setSelected(
      new Set(
        suggestions
          .filter((s) => {
            const diff = compare.diffBySuggestionId.get(s.id);
            return diff === "changed" || diff === "new";
          })
          .map((s) => s.id),
      ),
    );
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
      clearOrphanAssignments: compare.stats.hasCurrentSchedule,
    });
    handleOpenChange(false);
  };

  const renderSuggestedCell = (shift: WeekShiftCalendarShift, date: string) => {
    const color = shiftAccentColor(shift.color);
    const cell = suggestionsByKey.get(`${shift.id}|${date}`) ?? [];

    if (cell.length === 0) {
      return <CalendarEmptySlot label="Trống" />;
    }

    return cell.map((s) => (
      <label
        key={s.id}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition-all",
          !selected.has(s.id) && "opacity-40 saturate-50",
        )}
        style={shiftChipStyle(color)}
      >
        <Checkbox
          checked={selected.has(s.id)}
          onCheckedChange={(c) => toggle(s.id, c === true)}
          aria-label={`Chọn ${s.employeeName}`}
          className="size-3.5 shrink-0 border-current/40 data-[state=checked]:border-current"
        />
        <span className="truncate text-xs font-semibold">{s.employeeName}</span>
      </label>
    ));
  };

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    const response = await chatMutation.mutateAsync({ question: trimmed });
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
      },
    ]);
  };

  const loading = suggestMutation.isPending;
  const empty = hasGenerated && !loading && suggestions.length === 0;

  const hasContext = Boolean(
    contextQuery.data &&
      contextQuery.data.departmentId === listParams.departmentId &&
      contextQuery.data.weekStartDate === listParams.weekStartDate &&
      new Date(contextQuery.data.expiresAt).getTime() > Date.now(),
  );

  const days = weekDayDates(listParams.weekStartDate);
  const { data: shiftsData = [] } = useShiftsQuery({
    locationId,
    departmentId: listParams.departmentId,
  });
  const activeShifts = useMemo(
    () =>
      shiftsData
        .filter((s) => s.isActive)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
    [shiftsData],
  );
  const suggestionsByKey = useMemo(() => {
    const map = new Map<string, ScheduleSuggestion[]>();
    for (const s of suggestions) {
      const key = `${s.shiftDefinitionId}|${s.date}`;
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return map;
  }, [suggestions]);

  const { data: employeesPage } = useEmployeesQuery({
    departmentId: listParams.departmentId,
    pageSize: 100,
  });
  const employeeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const employee of employeesPage?.items ?? []) {
      map.set(employee.id, `${employee.firstName} ${employee.lastName}`.trim());
    }
    return map;
  }, [employeesPage?.items]);

  const hasCurrentAssignments = currentAssignments.length > 0;

  const compare = useMemo(
    () => buildSuggestionCompare(currentAssignments, suggestions, employeeNameById, activeShifts, days),
    [currentAssignments, suggestions, employeeNameById, activeShifts, days],
  );

  const inCompareMode =
    compare.stats.hasCurrentSchedule && hasGenerated && suggestions.length > 0;
  const showAssistant = !inCompareMode || assistantOpen;

  const contextGeneratedAt = contextQuery.data?.generatedAt
    ? format(parseISO(contextQuery.data.generatedAt), "dd/MM HH:mm")
    : null;
  const readinessLine = buildReadinessLine(reason, hasGenerated, suggestions.length);
  const weekLabel = format(parseISO(listParams.weekStartDate), "dd/MM/yyyy");

  const goToSetup = (target: "locations" | "employees" | "shifts" | "preferences") => {
    if (target === "preferences") {
      handleOpenChange(false);
      return;
    }

    const activeRole =
      parsed?.kind === "branch" || parsed?.kind === "org"
        ? parsed.role
        : role && isAppRole(role)
          ? role
          : ROLE_ADMIN;

    handleOpenChange(false);

    if (target === "locations") {
      router.push(orgPath("workspace", activeRole));
      return;
    }

    const feature = target === "employees" ? "employees" : "shifts";
    router.push(branchPath(feature, activeRole));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[1680px] flex-col gap-0 overflow-hidden",
          "rounded-2xl border border-border/80 p-0 shadow-2xl sm:max-w-[calc(100vw-1.5rem)]",
        )}
      >
        <header className="flex shrink-0 items-center gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <Sparkles className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate text-base font-semibold sm:text-lg">
                Gợi ý phân ca
              </DialogTitle>
              <DialogDescription className="truncate text-xs sm:text-sm">
                Tuần {weekLabel} · CP-SAT
                {hasGenerated && suggestions.length > 0
                  ? ` · ${selected.size}/${suggestions.length} đã chọn`
                  : ""}
              </DialogDescription>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {inCompareMode ? (
              <Button
                type="button"
                variant={assistantOpen ? "secondary" : "outline"}
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setAssistantOpen((open) => !open)}
              >
                <Bot className="size-4" aria-hidden />
                Trợ lý
              </Button>
            ) : null}
            {fallbackUsed ? (
              <Badge variant="outline" className="hidden sm:inline-flex">
                Một phần
              </Badge>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => void handleGenerate()}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Đang tạo…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden />
                  Tạo gợi ý
                </>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={
                !hasGenerated || empty || selected.size === 0 || applyMutation.isPending
              }
              onClick={() => void handleApply()}
            >
              {applyMutation.isPending
                ? "Đang áp dụng…"
                : compare.stats.hasCurrentSchedule
                  ? `Đè lịch cũ (${selected.size})`
                  : `Áp dụng (${selected.size})`}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleOpenChange(false)}
              aria-label="Đóng"
            >
              <X className="size-4" />
            </Button>
          </div>
        </header>

        {conflictCount > 0 ? (
          <div className="shrink-0 border-b border-amber-200/80 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 sm:px-5">
            Có {conflictCount} ca không khớp đăng ký — xóa trên lưới lịch nếu cần, rồi tạo gợi ý
            lại.
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section
            className={cn(
              "flex min-h-0 min-w-0 flex-col border-b lg:border-b-0",
              showAssistant ? "flex-[3] lg:border-r" : "flex-1",
            )}
          >
            {readinessLine ? (
              <div className="flex shrink-0 items-start gap-2 border-b border-amber-200/60 bg-amber-50/80 px-4 py-2.5 text-xs dark:bg-amber-950/20 sm:px-5">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-600" aria-hidden />
                <span className="flex-1 leading-relaxed">{readinessLine}</span>
                {setupTargetForReason(reason) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto shrink-0 px-2 py-0.5 text-xs"
                    onClick={() => goToSetup(setupTargetForReason(reason)!)}
                  >
                    Kiểm tra
                  </Button>
                ) : null}
              </div>
            ) : null}

            {hasGenerated && suggestions.length > 0 && !inCompareMode ? (
              <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2 sm:px-5">
                <p className="text-xs text-muted-foreground">Chọn gợi ý cần áp dụng vào lịch nháp</p>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={selectAll}>
                    <CheckCheck className="size-3.5" aria-hidden />
                    Tất cả
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={selectNone}>
                    <Square className="size-3.5" aria-hidden />
                    Bỏ chọn
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-5">
              {hasGenerated && !loading && !empty && suggestions.length > 0 ? (
                inCompareMode ? (
                  <SuggestionDiffView
                    days={days}
                    shifts={activeShifts}
                    slotEntries={compare.slotEntries}
                    stats={compare.stats}
                    selected={selected}
                    onToggle={toggle}
                    onSelectChangesOnly={selectChangesOnly}
                    onSelectAll={selectAll}
                  />
                ) : (
                  <div className="min-h-0 flex-1 overflow-x-auto">
                    <WeekShiftCalendar
                      fillHeight
                      className="min-w-[880px]"
                      days={days}
                      shifts={activeShifts}
                      renderCell={renderSuggestedCell}
                    />
                  </div>
                )
              ) : !hasGenerated && !loading && hasCurrentAssignments ? (
                <div className="flex min-h-0 flex-1 flex-col gap-2">
                  <div className="shrink-0 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    Lịch nháp tuần này đã có {currentAssignments.length} ca được phân — kéo-thả để
                    chuyển ca, bấm chip để xóa, hoặc nhấn{" "}
                    <strong className="text-foreground">Tạo gợi ý</strong> nếu bạn muốn CP-SAT đề
                    xuất điều chỉnh.
                  </div>
                  <ScrollArea className="min-h-0 flex-1">
                    <ScheduleGrid
                      scheduleId={scheduleId}
                      departmentId={listParams.departmentId}
                      locationId={locationId}
                      weekStartDate={listParams.weekStartDate}
                      status={status}
                      assignments={currentAssignments}
                    />
                  </ScrollArea>
                </div>
              ) : (
                <ScrollArea className="min-h-0 flex-1">
                  <div className="p-4 sm:p-5">
                    {!hasGenerated ? (
                      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
                        <Sparkles className="size-8 text-violet-500/70" aria-hidden />
                        <p className="max-w-md text-sm text-muted-foreground">
                          Nhấn <strong className="text-foreground">Tạo gợi ý</strong> để CP-SAT đề
                          xuất phân ca từ đăng ký đã gửi. Bạn có thể hỏi trợ lý bên phải sau khi có
                          gợi ý.
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={loading}
                          onClick={() => void handleGenerate()}
                        >
                          Tạo gợi ý
                        </Button>
                      </div>
                    ) : loading ? (
                      <div className="flex min-h-[240px] items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Đang chạy CP-SAT…
                      </div>
                    ) : (
                      <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
                        <AlertCircle className="size-8 text-muted-foreground/60" aria-hidden />
                        <p className="max-w-md text-sm text-muted-foreground">
                          {mapSuggestReason(reason)}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </section>

          {showAssistant ? (
          <aside className="flex min-h-[280px] min-w-0 flex-1 flex-col bg-muted/15 lg:max-w-[25%] lg:min-w-[280px] lg:flex-[1]">
            <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
              <Bot className="size-4 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Trợ lý lịch</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {hasContext
                    ? `Snapshot ${contextGeneratedAt}`
                    : "Chạy gợi ý trước để hỏi AI"}
                </p>
              </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-3 p-4">
                <div className="flex gap-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="size-3.5" aria-hidden />
                  </div>
                  <div className="rounded-lg rounded-tl-none bg-background px-3 py-2 text-xs leading-5 shadow-sm ring-1 ring-border/80">
                    Hỏi về lý do phân ca, ràng buộc org, hoặc cách cải thiện lịch tuần này. Tôi
                    chỉ giải thích — không tự áp dụng lịch.
                  </div>
                </div>

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Bot className="size-3.5" aria-hidden />
                      </div>
                    ) : null}
                    <div
                      className={cn(
                        "max-w-[92%] rounded-lg px-3 py-2 text-xs leading-5 whitespace-pre-wrap",
                        message.role === "user"
                          ? "rounded-tr-none bg-primary text-primary-foreground"
                          : "rounded-tl-none bg-background shadow-sm ring-1 ring-border/80",
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {chatMutation.isPending ? (
                  <div className="flex gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />
                    </div>
                    <div className="rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground ring-1 ring-border/80">
                      Đang phân tích…
                    </div>
                  </div>
                ) : null}
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t bg-background p-3">
              <div className="relative">
                <Textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleAsk();
                    }
                  }}
                  placeholder={
                    hasContext ? "Hỏi về lịch tuần này…" : "Tạo gợi ý trước để chat"
                  }
                  rows={2}
                  maxLength={1000}
                  disabled={!hasContext || chatMutation.isPending}
                  className="min-h-[72px] resize-none rounded-xl pr-11 text-sm"
                />
                <Button
                  type="button"
                  size="icon-sm"
                  className="absolute right-2 bottom-2"
                  disabled={!hasContext || !question.trim() || chatMutation.isPending}
                  onClick={() => void handleAsk()}
                  aria-label="Gửi câu hỏi"
                >
                  <SendHorizontal className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          </aside>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function setupTargetForReason(
  reason: string | null,
): "locations" | "employees" | "shifts" | "preferences" | null {
  if (reason === "no_employees" || reason === "missing_department_memberships") return "employees";
  if (reason === "no_shifts") return "shifts";
  if (reason === "missing_preferences") return "preferences";
  return null;
}
