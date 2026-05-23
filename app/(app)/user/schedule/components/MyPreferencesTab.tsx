"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addWeeksISO, toMondayISO, weekDayDates } from "@/lib/support/schedule/week";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { NoEmployeeLinked } from "@/app/(app)/user/components/NoEmployeeLinked";
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

export function MyPreferencesTab() {
  const [weekStartDate, setWeekStartDate] = useState(() => addWeeksISO(toMondayISO(new Date()), 1));

  const { data: preferenceSchedule, isLoading: scheduleLoading, error: scheduleError } =
    useEmployeePreferenceScheduleQuery(weekStartDate);
  const scheduleId = preferenceSchedule?.scheduleId ?? null;

  const { data: prefs, isLoading: prefsLoading } = useMySchedulePreferencesQuery(scheduleId);

  const saveMutation = useSaveSchedulePreferencesMutation(scheduleId ?? "");
  const submitMutation = useSubmitSchedulePreferencesMutation(scheduleId ?? "");

  const [lines, setLines] = useState<SchedulePreferenceLine[]>([]);
  const [dirty, setDirty] = useState(false);
  const [editingSubmitted, setEditingSubmitted] = useState(false);

  useEffect(() => {
    if (prefs) {
      // Local editable copy is needed before the employee saves the draft.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLines(prefs.lines);
      setDirty(false);
      setEditingSubmitted(false);
    }
  }, [prefs]);

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
        <span className="min-w-[160px] text-center text-sm font-medium">
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
    ? "Đây là đăng ký ca của bạn cho tuần này. Lịch làm việc chính thức nằm ở tab Lịch đã công bố và do admin/manager quyết định cuối cùng."
    : "Nhấn từng ô để chọn mức mong muốn làm ca đó: Ưu tiên, Có thể làm, hoặc Trống nếu không đăng ký ca này. Lưu nháp trước khi gửi." +
      (submitted && !editingSubmitted
        ? " Đã gửi - bấm Chỉnh sửa đăng ký để thay đổi và gửi lại."
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
      setLines((prev) => {
        const filtered = prev.filter(
          (l) => !(l.shiftDefinitionId === shiftDefinitionId && l.date === date),
        );
        if (next) {
          filtered.push({ shiftDefinitionId, date, preferenceType: next });
        }
        return filtered;
      });
      setDirty(true);
    },
    [lineMap, readOnly],
  );

  const handleSave = async () => {
    if (!scheduleId) return;
    await saveMutation.mutateAsync({ lines });
    setDirty(false);
  };

  const handleSubmit = async () => {
    if (!scheduleId) return;
    // PUT resets Submitted → Draft on server; required before POST submit.
    const mustSaveBeforeSubmit = dirty || submitted || editingSubmitted;
    if (mustSaveBeforeSubmit) {
      await saveMutation.mutateAsync({ lines });
      setDirty(false);
    }
    await submitMutation.mutateAsync();
    setEditingSubmitted(false);
  };

  const scheduleErrorCode =
    scheduleError && typeof scheduleError === "object" && "messageCode" in scheduleError
      ? String((scheduleError as { messageCode?: string }).messageCode)
      : undefined;

  if (scheduleErrorCode === "ME_NO_EMPLOYEE") {
    return <NoEmployeeLinked />;
  }

  if (scheduleLoading || prefsLoading) {
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
            Chưa có lịch cho tuần {format(parseISO(weekStartDate), "dd/MM/yyyy")}. Trưởng ca cần
            tạo lịch tuần trước khi bạn đăng ký ca.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {weekControls}

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
                          className="inline-flex rounded-md disabled:opacity-60"
                          onClick={() => toggleCell(shift.shiftDefinitionId, date)}
                        >
                          <PreferenceTypeCell type={type} compact showFullLabel />
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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditingSubmitted(true)}>
            Chỉnh sửa đăng ký
          </Button>
        </div>
      ) : !readOnly ? (
        <div className="flex flex-wrap gap-2">
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
              onClick={() => {
                setLines(prefs?.lines ?? []);
                setDirty(false);
                setEditingSubmitted(false);
              }}
            >
              Huỷ sửa
            </Button>
          ) : null}
          <Button
            disabled={
              submitMutation.isPending ||
              saveMutation.isPending ||
              lines.length === 0
            }
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
