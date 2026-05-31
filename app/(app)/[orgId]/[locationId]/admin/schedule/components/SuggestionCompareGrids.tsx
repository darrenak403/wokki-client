"use client";

import type { ReactNode } from "react";
import {
  CalendarEmptySlot,
  WeekShiftCalendar,
  type WeekShiftCalendarShift,
} from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/WeekShiftCalendar";
import { shiftAccentColor, shiftChipStyle } from "@/lib/support/schedule/shift-calendar";
import type { ShiftAssignmentResponse } from "@/types/schedule";

type SuggestionCompareGridsProps = {
  days: string[];
  shifts: WeekShiftCalendarShift[];
  currentAssignments: ShiftAssignmentResponse[];
  employeeNameById: Map<string, string>;
  renderSuggestedCell: (shift: WeekShiftCalendarShift, date: string) => ReactNode;
};

function assignmentsByKey(assignments: ShiftAssignmentResponse[]) {
  const map = new Map<string, ShiftAssignmentResponse[]>();
  for (const assignment of assignments) {
    const key = `${assignment.shiftDefinitionId}|${assignment.date}`;
    const list = map.get(key) ?? [];
    list.push(assignment);
    map.set(key, list);
  }
  return map;
}

export function SuggestionCompareGrids({
  days,
  shifts,
  currentAssignments,
  employeeNameById,
  renderSuggestedCell,
}: SuggestionCompareGridsProps) {
  const currentByKey = assignmentsByKey(currentAssignments);

  return (
    <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
      <div className="flex min-h-0 min-w-0 flex-col gap-2">
        <div className="shrink-0 rounded-lg border bg-muted/40 px-3 py-2">
          <p className="text-xs font-semibold text-foreground">Lịch đã phân</p>
          <p className="text-[11px] text-muted-foreground">Phân ca nháp hiện tại — chỉ xem</p>
        </div>
        <div className="min-h-0 flex-1 overflow-x-auto">
          <WeekShiftCalendar
            fillHeight
            className="min-w-[420px]"
            days={days}
            shifts={shifts}
            renderCell={(shift, date) => {
              const color = shiftAccentColor(shift.color);
              const cell = currentByKey.get(`${shift.id}|${date}`) ?? [];
              if (cell.length === 0) return <CalendarEmptySlot label="Trống" />;
              return cell.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-lg border px-2.5 py-2 text-xs font-semibold opacity-90"
                  style={shiftChipStyle(color)}
                >
                  {employeeNameById.get(assignment.employeeId) ?? "Nhân viên"}
                </div>
              ));
            }}
          />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-col gap-2">
        <div className="shrink-0 rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-2 dark:border-violet-900 dark:bg-violet-950/30">
          <p className="text-xs font-semibold text-foreground">Gợi ý mới</p>
          <p className="text-[11px] text-muted-foreground">Chọn ô cần áp dụng — sẽ đè lên lịch cũ</p>
        </div>
        <div className="min-h-0 flex-1 overflow-x-auto">
          <WeekShiftCalendar
            fillHeight
            className="min-w-[420px]"
            days={days}
            shifts={shifts}
            renderCell={renderSuggestedCell}
          />
        </div>
      </div>
    </div>
  );
}
