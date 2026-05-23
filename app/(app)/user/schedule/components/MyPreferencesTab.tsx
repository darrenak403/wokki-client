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
  useEmployeeDraftScheduleQuery,
  useMySchedulePreferencesQuery,
  useSaveSchedulePreferencesMutation,
  useSubmitSchedulePreferencesMutation,
} from "@/hooks/useSchedulePreferences";
import { usePreferenceBoardQuery } from "@/hooks/usePreferenceBoard";
import { mapSchedulePreferenceError } from "@/lib/support/schedule-preference/map-errors";
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
  const [weekStartDate, setWeekStartDate] = useState(() => toMondayISO(new Date()));

  const { data: draft, isLoading: draftLoading, error: draftError } =
    useEmployeeDraftScheduleQuery(weekStartDate);
  const scheduleId = draft?.scheduleId ?? null;

  const { data: prefs, isLoading: prefsLoading } = useMySchedulePreferencesQuery(scheduleId);
  const { data: board } = usePreferenceBoardQuery(scheduleId, Boolean(scheduleId));

  const saveMutation = useSaveSchedulePreferencesMutation(scheduleId ?? "");
  const submitMutation = useSubmitSchedulePreferencesMutation(scheduleId ?? "");

  const [lines, setLines] = useState<SchedulePreferenceLine[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (prefs) {
      setLines(prefs.lines);
      setDirty(false);
    }
  }, [prefs]);

  const submitted = prefs?.status === "Submitted";
  const readOnly = submitted || !scheduleId;

  const weekDays = useMemo(() => weekDayDates(weekStartDate), [weekStartDate]);
  const shifts = board?.shifts ?? [];

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
    if (dirty) await handleSave();
    await submitMutation.mutateAsync();
  };

  const draftErrorCode =
    draftError && typeof draftError === "object" && "messageCode" in draftError
      ? String((draftError as { messageCode?: string }).messageCode)
      : undefined;

  if (draftErrorCode === "ME_NO_EMPLOYEE") {
    return <NoEmployeeLinked />;
  }

  if (draftLoading || prefsLoading) {
    return <p className="text-sm text-muted-foreground">Đang tải đăng ký ca…</p>;
  }

  if (!scheduleId) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có lịch Nháp cho tuần {format(parseISO(weekStartDate), "dd/MM/yyyy")}. Trưởng ca
          cần tạo lịch tuần trước khi bạn đăng ký ca.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <span className="min-w-[120px] text-center text-sm font-medium">
            Tuần {format(parseISO(weekStartDate), "dd/MM", { locale: vi })}
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
        {submitted ? (
          <Badge>Đã gửi đăng ký</Badge>
        ) : (
          <Badge variant="secondary">Nháp — chưa gửi</Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Nhấn từng ô để chuyển: Ưu tiên → Có thể → Không → trống. Lưu nháp trước khi gửi.
      </p>

      {!board || shifts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Đang tải danh sách ca…</p>
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
                          className="inline-flex disabled:opacity-60"
                          onClick={() => toggleCell(shift.shiftDefinitionId, date)}
                        >
                          <PreferenceTypeCell type={type} compact />
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

      {!readOnly ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!dirty || saveMutation.isPending}
            onClick={() => void handleSave()}
          >
            {saveMutation.isPending ? "Đang lưu…" : "Lưu nháp"}
          </Button>
          <Button
            disabled={submitMutation.isPending || lines.length === 0}
            onClick={() => void handleSubmit()}
          >
            {submitMutation.isPending ? "Đang gửi…" : "Gửi đăng ký"}
          </Button>
        </div>
      ) : null}

      {draftError && !draftErrorCode ? (
        <p className="text-sm text-destructive">{mapSchedulePreferenceError(draftError)}</p>
      ) : null}
    </div>
  );
}
