"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Bot, CheckCircle2, SendHorizontal, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useApplySuggestionsMutation,
  useScheduleInsightChatMutation,
  useScheduleInsightContextQuery,
  useSuggestScheduleMutation,
} from "@/hooks/useSchedule";
import { useShiftsQuery } from "@/hooks/useShifts";
import { mapSuggestReason } from "@/lib/support/schedule/suggest-reasons";
import { weekDayDates } from "@/lib/support/schedule/week";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { CSSProperties } from "react";
import type { ScheduleSuggestion } from "@/types/schedule";

const DAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function timeToMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.slice(0, 5).split(":");
  return Number(hours) * 60 + Number(minutes);
}

function shiftPillStyle(color: string): CSSProperties {
  return {
    backgroundColor: `color-mix(in srgb, ${color} 22%, white)`,
    borderColor: `color-mix(in srgb, ${color} 38%, white)`,
    color: `color-mix(in srgb, ${color} 72%, #0b1e3d)`,
    boxShadow: `0 1px 2px color-mix(in srgb, ${color} 18%, transparent)`,
  };
}

type SuggestionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string;
  locationId: string;
  listParams: { departmentId: string; weekStartDate: string };
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
}: SuggestionsSheetProps) {
  const router = useRouter();
  const suggestMutation = useSuggestScheduleMutation(scheduleId);
  const applyMutation = useApplySuggestionsMutation(scheduleId, listParams);
  const contextQuery = useScheduleInsightContextQuery(scheduleId, open);
  const chatMutation = useScheduleInsightChatMutation(scheduleId);

  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [reason, setReason] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const resetSheetState = () => {
    setSuggestions([]);
    setReason(null);
    setProvider(null);
    setFallbackUsed(false);
    setSelected(new Set());
    setHasGenerated(false);
    setQuestion("");
    setMessages([]);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetSheetState();
    onOpenChange(next);
  };

  const handleGenerate = async () => {
    try {
      const data = await suggestMutation.mutateAsync({ useAi: true });
      setSuggestions(data.suggestions);
      setReason(data.reason);
      setProvider(data.provider);
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
  const isInfeasible = empty && reason === "infeasible";

  // Parse insight context JSON for schedule display when suggestions are empty.
  const parsedContext = (() => {
    if (!contextQuery.data?.jsonContent) return null;
    try {
      return JSON.parse(contextQuery.data.jsonContent) as {
        shifts?: Array<{ id: string; name: string; startTime: string; endTime: string }>;
        existingAssignments?: Array<{
          date: string;
          shiftName: string;
          employeeId: string;
          employeeName: string;
          shiftDefinitionId: string;
        }>;
        suggestedAssignments?: Array<{
          date: string;
          shiftName: string;
          employeeId: string;
          employeeName: string;
          shiftDefinitionId: string;
        }>;
      };
    } catch {
      return null;
    }
  })();

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
  const contextGeneratedAt = contextQuery.data?.generatedAt
    ? format(parseISO(contextQuery.data.generatedAt), "dd/MM HH:mm")
    : null;
  const preflightItems = buildPreflightItems(reason, hasGenerated, suggestions.length);

  const goToSetup = (target: "locations" | "employees" | "shifts" | "preferences") => {
    const isManager = window.location.pathname.startsWith("/manager");
    if (target === "preferences") return handleOpenChange(false);
    router.push(`/${isManager ? "manager" : "admin"}/${target}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 ring-0 sm:max-w-none">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-0.5">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" aria-hidden />
                Gợi ý phân ca & insight
              </DialogTitle>
              <DialogDescription>
                Gợi ý chạy theo từng phòng ban/tuần. Snapshot insight được tạo tự động sau khi gợi ý thành công.
              </DialogDescription>
            </div>
            <Button
              type="button"
              className="shrink-0"
              disabled={loading}
              onClick={() => void handleGenerate()}
            >
              {loading ? "Đang tạo gợi ý…" : "Tạo gợi ý"}
            </Button>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">

            <ScrollArea className="min-h-0 flex-1">
              <div className="p-5">
                <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {preflightItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex min-h-20 items-start gap-3 rounded-md border bg-background p-3"
                    >
                      {item.ok ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {!hasGenerated ? (
                  <div className="flex min-h-[360px] items-center justify-center rounded-md border border-dashed bg-muted/20 p-6 text-center">
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Nhấn Tạo gợi ý để xem danh sách phân ca đề xuất cho lịch Nháp.
                    </p>
                  </div>
                ) : loading ? (
                  <p className="text-sm text-muted-foreground">Đang tạo gợi ý…</p>
                ) : empty ? (
                  <div className="space-y-4">
                    {hasContext && parsedContext?.shifts && parsedContext.shifts.length > 0 ? (
                      <ContextCalendarTable
                        label="Lịch hiện tại (snapshot)"
                        shifts={parsedContext.shifts}
                        assignments={parsedContext.existingAssignments ?? []}
                        days={days}
                      />
                    ) : null}
                    {isInfeasible ? (
                      <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50/60 px-3 py-2 text-xs dark:bg-amber-950/20">
                        <AlertCircle className="size-3.5 shrink-0 text-amber-600" aria-hidden />
                        <span className="text-amber-800 dark:text-amber-300">
                          Solver không tìm được lịch hợp lệ — ràng buộc quá chặt. Kiểm tra nhân viên, ca và đăng ký ca, sau đó thử lại.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
                        <AlertCircle className="size-3.5 shrink-0" aria-hidden />
                        <span>{mapSuggestReason(reason)}</span>
                        {setupTargetForReason(reason) ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-auto px-2 py-0.5 text-xs"
                            onClick={() => goToSetup(setupTargetForReason(reason)!)}
                          >
                            Kiểm tra
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {provider ? (
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          Nguồn:{" "}
                          {provider?.startsWith("cpsat")
                            ? "CP-SAT"
                            : provider === "bedrock"
                              ? "Bedrock"
                              : "Heuristic"}
                        </Badge>
                        {fallbackUsed ? <Badge variant="outline">Fallback</Badge> : null}
                        <Badge variant="outline">
                          {selected.size}/{suggestions.length} đã chọn
                        </Badge>
                      </div>
                    ) : null}
                    <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950/30">
                      <div className="overflow-x-auto">
                        <Table className="min-w-[900px]">
                          <TableHeader>
                            <TableRow className="border-neutral-100 hover:bg-transparent dark:border-neutral-800">
                              <TableHead className="sticky left-0 z-10 min-w-[150px] bg-neutral-50/80 dark:bg-neutral-900/80">
                                Khung ca
                              </TableHead>
                              {days.map((date, index) => (
                                <TableHead
                                  key={date}
                                  className="min-w-[110px] bg-neutral-50/80 text-left dark:bg-neutral-900/80"
                                >
                                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {DAY_HEADERS[index]}
                                  </div>
                                  <div className="text-sm font-semibold text-foreground">
                                    {format(parseISO(date), "dd/MM")}
                                  </div>
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activeShifts.map((shift) => {
                              const color = shift.color || "#1d4d8f";
                              return (
                                <TableRow
                                  key={shift.id}
                                  className="border-neutral-100 dark:border-neutral-800"
                                >
                                  <TableCell className="sticky left-0 z-10 bg-white align-top dark:bg-neutral-900">
                                    <div className="flex items-center gap-2 py-1">
                                      <span
                                        className="size-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-neutral-900"
                                        style={{ backgroundColor: color }}
                                      />
                                      <span className="text-sm font-semibold text-foreground">
                                        {shift.name}
                                      </span>
                                    </div>
                                  </TableCell>
                                  {days.map((date) => {
                                    const cell =
                                      suggestionsByKey.get(`${shift.id}|${date}`) ?? [];
                                    return (
                                      <TableCell
                                        key={`${shift.id}-${date}`}
                                        className="align-top bg-white dark:bg-neutral-900"
                                      >
                                        <div className="min-h-[72px] space-y-1.5 py-0.5">
                                          {cell.length === 0 ? (
                                            <span className="text-xs text-muted-foreground">
                                              —
                                            </span>
                                          ) : (
                                            cell.map((s) => (
                                              <label
                                                key={s.id}
                                                className="flex cursor-pointer items-center gap-1.5"
                                              >
                                                <Checkbox
                                                  checked={selected.has(s.id)}
                                                  onCheckedChange={(c) =>
                                                    toggle(s.id, c === true)
                                                  }
                                                  aria-label={`Chọn ${s.employeeName}`}
                                                  className="shrink-0"
                                                />
                                                <span
                                                  className={cn(
                                                    "block w-full truncate rounded-lg border px-2 py-1.5 text-xs font-semibold transition-opacity",
                                                    !selected.has(s.id) && "opacity-40",
                                                  )}
                                                  style={shiftPillStyle(color)}
                                                >
                                                  {s.employeeName}
                                                </span>
                                              </label>
                                            ))
                                          )}
                                        </div>
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </section>

          <aside className="flex min-h-0 flex-col bg-muted/10">
            <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Bot className="size-4 text-primary" aria-hidden />
                  <p className="truncate text-sm font-medium">Trợ lý insight Bedrock</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {hasContext ? `Đã có context: ${contextGeneratedAt}` : "Chưa có context hợp lệ"}
                </p>
              </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-4 p-5">
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="size-4" aria-hidden />
                  </div>
                  <div className="max-w-[85%] rounded-lg bg-background p-3 text-sm leading-6 shadow-sm ring-1 ring-border">
                    Bạn cần tôi hổ trợ phân bố lịch cho tuần này như nào?
                  </div>
                </div>

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.role === "user" ? "flex justify-end" : "flex gap-3"}
                  >
                    {message.role === "assistant" ? (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Bot className="size-4" aria-hidden />
                      </div>
                    ) : null}
                    <div
                      className={
                        message.role === "user"
                          ? "max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm leading-6 text-primary-foreground"
                          : "max-w-[85%] rounded-lg bg-background p-3 text-sm leading-6 whitespace-pre-wrap shadow-sm ring-1 ring-border"
                      }
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {chatMutation.isPending ? (
                  <div className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="size-4" aria-hidden />
                    </div>
                    <div className="rounded-lg bg-background p-3 text-sm text-muted-foreground shadow-sm ring-1 ring-border">
                      Đang phân tích snapshot...
                    </div>
                  </div>
                ) : null}
              </div>
            </ScrollArea>

            <div className="border-t bg-background p-4">
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
                  placeholder="Hỏi về lịch tuần này..."
                  rows={3}
                  maxLength={1000}
                  disabled={!hasContext || chatMutation.isPending}
                  className="min-h-20 resize-none rounded-xl pr-12"
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
              <p className="mt-2 text-xs text-muted-foreground">
                {hasContext
                  ? "Trợ lý chỉ hỗ trợ giải thích, không áp dụng hoặc cập nhật lịch."
                  : "Chạy Tạo gợi ý thành công để backend tự tạo context cho chatbot."}
              </p>
            </div>
          </aside>
        </div>

        <DialogFooter className="border-t px-5 py-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Đóng
          </Button>
          <Button
            disabled={!hasGenerated || empty || selected.size === 0 || applyMutation.isPending}
            onClick={() => void handleApply()}
          >
            {applyMutation.isPending ? "Đang áp dụng…" : `Áp dụng (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ContextShift = { id: string; name: string; startTime: string; endTime: string };
type ContextAssignment = {
  date: string;
  shiftName: string;
  employeeId: string;
  employeeName: string;
  shiftDefinitionId: string;
};

const CONTEXT_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];

function ContextCalendarTable({
  label,
  shifts,
  assignments,
  days,
}: {
  label: string;
  shifts: ContextShift[];
  assignments: ContextAssignment[];
  days: string[];
}) {
  const sortedShifts = [...shifts].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );
  const byKey = new Map<string, ContextAssignment[]>();
  for (const a of assignments) {
    const key = `${a.shiftDefinitionId}|${a.date}`;
    const list = byKey.get(key) ?? [];
    list.push(a);
    byKey.set(key, list);
  }
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950/30">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="border-neutral-100 hover:bg-transparent dark:border-neutral-800">
                <TableHead className="sticky left-0 z-10 min-w-[150px] bg-neutral-50/80 dark:bg-neutral-900/80">
                  Khung ca
                </TableHead>
                {days.map((date, index) => (
                  <TableHead
                    key={date}
                    className="min-w-[110px] bg-neutral-50/80 text-left dark:bg-neutral-900/80"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {DAY_HEADERS[index]}
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {format(parseISO(date), "dd/MM")}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedShifts.map((shift, si) => {
                const color = CONTEXT_COLORS[si % CONTEXT_COLORS.length]!;
                return (
                  <TableRow key={shift.id} className="border-neutral-100 dark:border-neutral-800">
                    <TableCell className="sticky left-0 z-10 bg-white align-top dark:bg-neutral-900">
                      <div className="flex items-center gap-2 py-1">
                        <span
                          className="size-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-neutral-900"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-semibold text-foreground">{shift.name}</span>
                      </div>
                    </TableCell>
                    {days.map((date) => {
                      const cell = byKey.get(`${shift.id}|${date}`) ?? [];
                      return (
                        <TableCell
                          key={`${shift.id}-${date}`}
                          className="align-top bg-white dark:bg-neutral-900"
                        >
                          <div className="min-h-[64px] space-y-1.5 py-0.5">
                            {cell.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              cell.map((a) => (
                                <span
                                  key={`${a.employeeId}-${a.date}`}
                                  className="block truncate rounded-lg border px-2 py-1.5 text-xs font-semibold"
                                  style={shiftPillStyle(color)}
                                >
                                  {a.employeeName}
                                </span>
                              ))
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function buildPreflightItems(
  reason: string | null,
  hasGenerated: boolean,
  suggestionCount: number,
) {
  const blocked = hasGenerated ? reason : null;
  return [
    {
      key: "location-policy",
      label: "Luật chi nhánh",
      ok: blocked !== "missing_location_rules",
      description:
        blocked === "missing_location_rules"
          ? "Chi nhánh chưa có rule catalog bắt buộc."
          : "Solver dùng luật chi nhánh làm điều kiện nền.",
    },
    {
      key: "employees",
      label: "Nhân viên phòng ban",
      ok: blocked !== "no_employees" && blocked !== "missing_department_memberships",
      description:
        blocked === "no_employees" || blocked === "missing_department_memberships"
          ? "Cần nhân viên active thuộc phòng ban này."
          : "Nhân viên được lọc theo membership phòng ban.",
    },
    {
      key: "shifts",
      label: "Ca làm việc",
      ok: blocked !== "no_shifts",
      description:
        blocked === "no_shifts"
          ? "Phòng ban chưa có ca active để xếp."
          : "Gợi ý chỉ dùng ca active của phòng ban.",
    },
    {
      key: "preferences",
      label: "Đăng ký ca",
      ok: blocked !== "missing_preferences" && (!hasGenerated || suggestionCount > 0),
      description:
        blocked === "missing_preferences"
          ? "Cần nhân viên gửi đăng ký ca cho tuần này."
          : "Preference là input bắt buộc để tăng hài lòng.",
    },
  ];
}

function setupTargetForReason(
  reason: string | null,
): "locations" | "employees" | "shifts" | "preferences" | null {
  if (reason === "missing_location_rules") return "locations";
  if (reason === "no_employees" || reason === "missing_department_memberships") return "employees";
  if (reason === "no_shifts") return "shifts";
  if (reason === "missing_preferences") return "preferences";
  return null;
}
