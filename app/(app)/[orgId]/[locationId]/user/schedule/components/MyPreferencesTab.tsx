"use client";

import { useCallback, useMemo, useState } from "react";
import { addWeeksISO, toMondayISO, weekDayDates } from "@/lib/support/schedule/week";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { NoEmployeeLinked } from "@/app/(app)/[orgId]/[locationId]/user/components/NoEmployeeLinked";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cyclePreferenceType,
  PreferenceTypeCell,
} from "@/components/shared/admin/preference-type-cell";
import {
  useEmployeePreferenceScheduleQuery,
  useMySchedulePreferencesQuery,
  useSaveSchedulePreferencesMutation,
  useSubmitSchedulePreferencesMutation,
} from "@/hooks/useSchedulePreferences";
import { mapSchedulePreferenceError } from "@/lib/support/schedule-preference/map-errors";
import { scheduleStatusLabel } from "@/lib/support/schedule/status";
import { SCHEDULE_STATUS } from "@/types/schedule";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type {
  PreferenceType,
  SchedulePreferenceLine,
} from "@/types/schedule-preferences";

function lineKey(shiftDefinitionId: string, date: string) {
  return `${shiftDefinitionId}:${date}`;
}

type PreferencesLocalPatch = {
  revision: string;
  lines: SchedulePreferenceLine[];
  dirty: boolean;
  editingSubmitted: boolean;
};

export function MyPreferencesTab() {
  const [weekStartDate, setWeekStartDate] = useState(() => addWeeksISO(toMondayISO(new Date()), 1));

  const { data: preferenceSchedule, isLoading: scheduleLoading, error: scheduleError } =
    useEmployeePreferenceScheduleQuery(weekStartDate);
  const scheduleId = preferenceSchedule?.scheduleId ?? null;

  const { data: prefs, isLoading: prefsLoading } = useMySchedulePreferencesQuery(scheduleId);

  const saveMutation = useSaveSchedulePreferencesMutation(scheduleId ?? "");
  const submitMutation = useSubmitSchedulePreferencesMutation(scheduleId ?? "");

  const [patch, setPatch] = useState<PreferencesLocalPatch | null>(null);

  const prefsSynced = Boolean(prefs && scheduleId && prefs.scheduleId === scheduleId);
  const revision = scheduleId
    ? `${scheduleId}:${prefs?.submissionId ?? "none"}:${prefs?.status ?? ""}`
    : "";

  const serverLines = prefsSynced && prefs ? prefs.lines : [];
  const lines = patch?.revision === revision ? patch.lines : serverLines;
  const dirty = patch?.revision === revision ? patch.dirty : false;
  const editingSubmitted = patch?.revision === revision ? patch.editingSubmitted : false;

  const weekDays = useMemo(() => weekDayDates(weekStartDate), [weekStartDate]);
  const shifts = preferenceSchedule?.shifts ?? [];
  const scheduleStatus = preferenceSchedule?.status;
  const scheduleIsDraft = scheduleStatus === SCHEDULE_STATUS.Draft;
  const scheduleIsPublished = scheduleStatus === SCHEDULE_STATUS.Published;
  const submitted = prefs?.status === "Submitted";
  const preferenceStatusLabel = prefs?.submissionId
    ? submitted
      ? "Đã gửi đăng ký"
      : "Nháp đăng ký"
    : "Chưa có đăng ký";
  const readOnly = !scheduleId || !scheduleIsDraft || (submitted && !editingSubmitted);

  const weekControls = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Tuần trước"
          onClick={() => setWeekStartDate((w) => addWeeksISO(w, -1))}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="min-w-0 text-center text-sm font-medium">
          Tuần {format(parseISO(weekStartDate), "dd/MM", { locale: vi })} -{" "}
          {format(parseISO(weekDays[6]), "dd/MM", { locale: vi })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Tuần sau"
          onClick={() => setWeekStartDate((w) => addWeeksISO(w, 1))}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
      {scheduleId ? (
        <div className="flex flex-wrap gap-2">
          <Badge variant={scheduleIsPublished ? "default" : "secondary"}>
            {scheduleStatus !== undefined ? scheduleStatusLabel(scheduleStatus) : "Lịch"}
          </Badge>
          {prefs?.submissionId ? (
            <Badge variant={submitted ? "default" : "secondary"}>{preferenceStatusLabel}</Badge>
          ) : (
            <Badge variant="outline">{preferenceStatusLabel}</Badge>
          )}
        </div>
      ) : (
        <Badge variant="outline">Chưa có lịch</Badge>
      )}
    </div>
  );

  const guidanceText = scheduleIsPublished
    ? "Lịch tuần này đã công bố — đăng ký ca chỉ xem. Lịch làm việc chính thức nằm ở tab Lịch đã công bố."
    : "Nhấn từng ô để chọn: Ưu tiên → Có thể → Trống. Lưu nháp trước khi gửi." +
      (submitted && !editingSubmitted
        ? " Đã gửi — bấm Chỉnh sửa đăng ký để thay đổi và gửi lại."
        : "");

  const lineMap = useMemo(() => {
    const map = new Map<string, PreferenceType>();
    for (const line of lines) {
      map.set(lineKey(line.shiftDefinitionId, line.date), line.preferenceType);
    }
    return map;
  }, [lines]);

  const toggleCell = useCallback(
    (shiftDefinitionId: string, date: string) => {
      if (readOnly) return;
      const key = lineKey(shiftDefinitionId, date);
      const current = lineMap.get(key) ?? null;
      const next = cyclePreferenceType(current);
      setPatch((prev) => {
        const baseLines = prev?.revision === revision ? prev.lines : serverLines;
        const filtered = baseLines.filter(
          (l) => !(l.shiftDefinitionId === shiftDefinitionId && l.date === date),
        );
        if (next) {
          filtered.push({ shiftDefinitionId, date, preferenceType: next });
        }
        return {
          revision,
          lines: filtered,
          dirty: true,
          editingSubmitted: prev?.revision === revision ? prev.editingSubmitted : false,
        };
      });
    },
    [lineMap, readOnly, revision, serverLines],
  );

  const buildSavePayload = useCallback((): SchedulePreferenceLine[] => {
    const shiftIds = new Set(shifts.map((s) => s.shiftDefinitionId));
    const daySet = new Set(weekDays);
    return lines.filter(
      (line) => shiftIds.has(line.shiftDefinitionId) && daySet.has(line.date),
    );
  }, [lines, shifts, weekDays]);

  const handleSave = async () => {
    if (!scheduleId) return;
    await saveMutation.mutateAsync({ lines: buildSavePayload() });
    setPatch(null);
  };

  const handleSubmit = async () => {
    if (!scheduleId) return;
    const payload = buildSavePayload();
    const mustSaveBeforeSubmit = dirty || submitted || editingSubmitted;
    if (mustSaveBeforeSubmit) {
      await saveMutation.mutateAsync({ lines: payload });
      setPatch(null);
    }
    await submitMutation.mutateAsync();
    setPatch(null);
  };

  const scheduleErrorCode =
    scheduleError && typeof scheduleError === "object" && "messageCode" in scheduleError
      ? String((scheduleError as { messageCode?: string }).messageCode)
      : undefined;

  if (scheduleErrorCode === "ME_NO_EMPLOYEE") {
    return <NoEmployeeLinked />;
  }

  if (scheduleLoading || prefsLoading || (scheduleId && !prefsSynced)) {
    return (
      <div className="space-y-6">
        {weekControls}
        <p className="text-sm text-muted-foreground">Đang tải đăng ký ca...</p>
      </div>
    );
  }

  if (!scheduleId) {
    return (
      <div className="space-y-6">
        {weekControls}
        <div className="rounded-lg border border-dashed bg-background p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Quản lý cần tạo lịch tuần trước khi bạn đăng ký ca (tuần{" "}
            {format(parseISO(weekStartDate), "dd/MM/yyyy")}).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {weekControls}

      {scheduleIsPublished ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
          Lịch đã công bố — xem ca chính thức ở tab <strong>Lịch đã công bố</strong>.
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">{guidanceText}</p>

      {shifts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có ca làm việc đang hoạt động cho lịch tuần này.
        </p>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 min-w-[100px] bg-background">
                  Ca
                </TableHead>
                {weekDays.map((date) => (
                  <TableHead key={date} className="min-w-[72px] text-center text-xs">
                    {format(parseISO(date), "EEE dd/MM", { locale: vi })}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.shiftDefinitionId}>
                  <TableCell className="sticky left-0 z-10 bg-background font-medium">
                    {shift.shiftName}
                  </TableCell>
                  {weekDays.map((date) => {
                    const type =
                      lineMap.get(lineKey(shift.shiftDefinitionId, date)) ?? null;
                    return (
                      <TableCell key={date} className="text-center">
                        <button
                          type="button"
                          disabled={readOnly}
                          aria-pressed={type !== null}
                          className="inline-flex rounded-md disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => toggleCell(shift.shiftDefinitionId, date)}
                        >
                          <PreferenceTypeCell
                            type={type}
                            compact
                            showFullLabel
                            interactive={!readOnly}
                          />
                        </button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {scheduleIsPublished ? null : submitted && !editingSubmitted ? (
        <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-2 border-t bg-background/95 px-1 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Button
            className="bg-brand-blue text-white hover:bg-brand-navy"
            onClick={() =>
              setPatch({
                revision,
                lines: serverLines,
                dirty: false,
                editingSubmitted: true,
              })
            }
          >
            Chỉnh sửa đăng ký
          </Button>
        </div>
      ) : !readOnly ? (
        <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-2 border-t bg-background/95 px-1 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Button
            variant="outline"
            disabled={!dirty || saveMutation.isPending}
            onClick={() => void handleSave()}
          >
            {saveMutation.isPending ? "Đang lưu…" : "Lưu nháp"}
          </Button>
          {editingSubmitted ? (
            <Button
              variant="ghost"
              disabled={saveMutation.isPending || submitMutation.isPending}
              onClick={() => setPatch(null)}
            >
              Huỷ sửa
            </Button>
          ) : null}
          <Button
            className="bg-brand-blue text-white hover:bg-brand-navy"
            disabled={
              submitMutation.isPending ||
              saveMutation.isPending ||
              lines.length === 0
            }
            title={lines.length === 0 ? "Chọn ít nhất một ca trước khi gửi" : undefined}
            onClick={() => void handleSubmit()}
          >
            {submitMutation.isPending
              ? "Đang gửi…"
              : editingSubmitted
                ? "Gửi lại đăng ký"
                : "Gửi đăng ký"}
          </Button>
        </div>
      ) : null}

      {scheduleError && !scheduleErrorCode ? (
        <p className="text-sm text-destructive">{mapSchedulePreferenceError(scheduleError)}</p>
      ) : null}
    </div>
  );
}
