"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useApplySuggestionsMutation,
  useScheduleInsightChatMutation,
  useScheduleInsightContextQuery,
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

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function SuggestionsSheet({
  open,
  onOpenChange,
  scheduleId,
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
    const data = await suggestMutation.mutateAsync({});
    setSuggestions(data.suggestions);
    setReason(data.reason);
    setProvider(data.provider);
    setFallbackUsed(data.fallbackUsed);
    setSelected(new Set(data.suggestions.map((s) => s.id)));
    setHasGenerated(true);
    await contextQuery.refetch();
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
  const hasContext = Boolean(
    contextQuery.data &&
      contextQuery.data.departmentId === listParams.departmentId &&
      contextQuery.data.weekStartDate === listParams.weekStartDate &&
      new Date(contextQuery.data.expiresAt).getTime() > Date.now(),
  );
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
          <DialogTitle>Gợi ý phân ca & insight</DialogTitle>
          <DialogDescription>
            Gợi ý chạy theo từng phòng ban/tuần. Snapshot insight được tạo tự động sau khi gợi ý thành công.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
            <div className="grid gap-3 border-b px-5 py-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" aria-hidden />
                  <p className="text-sm font-medium">Bộ gợi ý phân ca</p>
                </div>
                <p className="max-w-3xl text-xs text-muted-foreground">
                  Bedrock không tạo lịch. Kết quả bên dưới đến từ engine phân ca và chỉ được ghi khi
                  bạn nhấn Áp dụng.
                </p>
              </div>
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={loading}
                onClick={() => void handleGenerate()}
              >
                {loading ? "Đang tạo gợi ý…" : "Tạo gợi ý"}
              </Button>
            </div>

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
                  <div className="flex min-h-[320px] flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-6 text-center">
                    <p className="max-w-md text-sm font-medium">{mapSuggestReason(reason)}</p>
                    <p className="mt-2 max-w-md text-xs text-muted-foreground">
                      Auto-scheduling cần luật chi nhánh, nhân viên, ca làm và đăng ký ca trước khi chạy.
                    </p>
                    {setupTargetForReason(reason) ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() => goToSetup(setupTargetForReason(reason)!)}
                      >
                        Kiểm tra cấu hình
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <>
                    {provider ? (
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          Nguồn: {provider === "cp-sat" ? "CP-SAT" : "Heuristic"}
                        </Badge>
                        {fallbackUsed ? <Badge variant="outline">Fallback</Badge> : null}
                        <Badge variant="outline">
                          {selected.size}/{suggestions.length} đã chọn
                        </Badge>
                      </div>
                    ) : null}
                    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {suggestions.map((s) => (
                        <li
                          key={s.id}
                          className="flex min-h-24 items-start gap-3 rounded-md border p-3 text-sm"
                        >
                          <Checkbox
                            checked={selected.has(s.id)}
                            onCheckedChange={(c) => toggle(s.id, c === true)}
                            aria-label={`Chọn gợi ý ${s.employeeName}`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{s.employeeName}</p>
                            <p className="truncate text-muted-foreground">{s.shiftName}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {format(parseISO(s.date), "dd/MM/yyyy")} · Điểm {s.score}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
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
