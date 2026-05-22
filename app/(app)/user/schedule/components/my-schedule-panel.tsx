"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { NoEmployeeLinked } from "@/app/(app)/user/components/no-employee-linked";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import type { ApiError } from "@/types/api";
import type { ShiftAssignmentResponse } from "@/types/employee";

function groupByDate(assignments: ShiftAssignmentResponse[]) {
  const map = new Map<string, ShiftAssignmentResponse[]>();
  for (const a of [...assignments].sort((x, y) => x.date.localeCompare(y.date))) {
    const list = map.get(a.date) ?? [];
    list.push(a);
    map.set(a.date, list);
  }
  return map;
}

export function MySchedulePanel() {
  const { data: assignments = [], isLoading, isError, error } = useMyScheduleQuery();

  const byDate = useMemo(() => groupByDate(assignments), [assignments]);

  const errorCode =
    isError && error && typeof error === "object" && "messageCode" in error
      ? (error as unknown as ApiError).messageCode
      : undefined;
  const noEmployee = errorCode === "ME_NO_EMPLOYEE";

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Đang tải lịch…</p>;
  }

  if (noEmployee) {
    return <NoEmployeeLinked />;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">{mapEmployeeError(error)}</p>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có ca nào trong 28 ngày tới. Trưởng ca cần công bố lịch trước.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Lịch đã công bố — {assignments.length} phân ca trong 28 ngày tới.
      </p>
      <ul className="space-y-3">
        {[...byDate.entries()].map(([date, items]) => (
          <li key={date} className="rounded-lg border p-4">
            <p className="text-sm font-medium mb-2">
              {format(parseISO(date), "EEEE, dd/MM/yyyy", { locale: vi })}
            </p>
            <ul className="space-y-2">
              {items.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span>
                    <span className="font-medium">{a.shiftName}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {a.startTime.slice(0, 5)} – {a.endTime.slice(0, 5)}
                    </span>
                  </span>
                  {a.note ? (
                    <Badge variant="secondary" className="text-xs">
                      {a.note}
                    </Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
