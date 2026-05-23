"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DepartmentSelect } from "@/components/shared/department-select";
import { LocationSelect } from "@/components/shared/location-select";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { useRosterQuery } from "@/hooks/useRoster";
import { addWeeksISO, toMondayISO } from "@/lib/support/schedule/week";
import { mapScheduleError } from "@/lib/support/schedule/map-errors";

function toTime(value: string): string {
  return value.slice(0, 5);
}

export function RosterPanel() {
  const { session, setLocationId, setDepartmentId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;
  const [weekStartDate, setWeekStartDate] = useState(() => toMondayISO(new Date()));

  const rosterParams =
    departmentId && weekStartDate
      ? { weekStartDate, departmentId }
      : null;

  const { data: rows = [], isLoading, isError, error } = useRosterQuery(rosterParams);

  const weekLabel = useMemo(() => {
    const start = parseISO(weekStartDate);
    return `${format(start, "dd/MM", { locale: vi })} – ${format(
      new Date(start.getTime() + 6 * 86400000),
      "dd/MM/yyyy",
      { locale: vi },
    )}`;
  }, [weekStartDate]);

  const grouped = useMemo(() => {
    const byDate = new Map<string, typeof rows>();
    for (const row of rows) {
      const list = byDate.get(row.date) ?? [];
      list.push(row);
      byDate.set(row.date, list);
    }
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Chi nhánh</span>
          <LocationSelect value={locationId} onChange={setLocationId} />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Phòng ban</span>
          <DepartmentSelect
            locationId={locationId}
            value={departmentId}
            onChange={setDepartmentId}
            allowEmpty={false}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tuần</span>
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
            <span className="min-w-[130px] text-center text-sm font-medium">{weekLabel}</span>
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
        </div>
      </div>

      {!departmentId ? (
        <p className="text-sm text-muted-foreground">Chọn phòng ban để xem lịch tổng.</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải roster…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">{mapScheduleError(error)}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có phân ca trong tuần này.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, items]) => (
            <section key={date} className="space-y-2">
              <h3 className="text-sm font-semibold">
                {format(parseISO(date), "EEEE dd/MM/yyyy", { locale: vi })}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Ca</TableHead>
                    <TableHead>Giờ</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead>Lịch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.employeeFirstName} {row.employeeLastName}
                      </TableCell>
                      <TableCell>
                        <span
                          className="mr-2 inline-block size-2 rounded-full"
                          style={{ backgroundColor: row.shiftColor }}
                        />
                        {row.shiftName}
                      </TableCell>
                      <TableCell>
                        {toTime(row.startTime)} – {toTime(row.endTime)}
                      </TableCell>
                      <TableCell>{row.departmentName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.scheduleStatus}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
