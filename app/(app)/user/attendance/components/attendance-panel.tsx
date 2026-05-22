"use client";

import { useMemo, useState } from "react";
import { format, isToday, parseISO } from "date-fns";
import { NoEmployeeLinked } from "@/app/(app)/user/components/no-employee-linked";
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
import {
  useAttendanceHistoryQuery,
  useClockInMutation,
  useClockOutMutation,
  useOpenAttendanceRecord,
} from "@/hooks/useAttendance";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import type { ApiError } from "@/types/api";

export function AttendancePanel() {
  const { data: assignments = [], isError: scheduleError, error: scheduleErr } =
    useMyScheduleQuery();
  const { data: history = [], isLoading: historyLoading } = useAttendanceHistoryQuery();
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();
  const openRecord = useOpenAttendanceRecord();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");

  const scheduleErrorCode =
    scheduleError && scheduleErr && typeof scheduleErr === "object" && "messageCode" in scheduleErr
      ? (scheduleErr as unknown as ApiError).messageCode
      : undefined;
  if (scheduleErrorCode === "ME_NO_EMPLOYEE") {
    return <NoEmployeeLinked />;
  }

  const todayShifts = useMemo(
    () => assignments.filter((a) => isToday(parseISO(a.date))),
    [assignments],
  );

  const handleClockIn = async () => {
    if (todayShifts.length > 1) {
      if (!selectedAssignmentId) return;
      await clockInMutation.mutateAsync({ assignmentId: selectedAssignmentId });
      return;
    }
    if (todayShifts.length === 1) {
      await clockInMutation.mutateAsync({ assignmentId: todayShifts[0].id });
      return;
    }
    await clockInMutation.mutateAsync({});
  };

  const canClockIn = !openRecord && todayShifts.length > 0;
  const canClockOut = Boolean(openRecord);
  const needsShiftPick = todayShifts.length > 1;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-sm font-medium">Hôm nay</h2>
        {todayShifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Không có ca đã công bố hôm nay — không thể chấm công.
          </p>
        ) : (
          <ul className="text-sm space-y-1">
            {todayShifts.map((s) => (
              <li key={s.id}>
                {s.shiftName} · {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
              </li>
            ))}
          </ul>
        )}

        {needsShiftPick ? (
          <select
            className="h-8 w-full max-w-md rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            aria-label="Chọn ca để chấm công"
          >
            <option value="">Chọn ca hôm nay</option>
            {todayShifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shiftName} · {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
              </option>
            ))}
          </select>
        ) : null}

        {openRecord ? (
          <p className="text-sm">
            Đang chấm công từ{" "}
            <span className="font-medium">
              {format(parseISO(openRecord.clockIn), "HH:mm dd/MM")}
            </span>
          </p>
        ) : null}

        <div className="flex gap-2">
          <Button
            disabled={
              !canClockIn ||
              clockInMutation.isPending ||
              (needsShiftPick && !selectedAssignmentId)
            }
            onClick={() => void handleClockIn()}
          >
            {clockInMutation.isPending ? "Đang vào…" : "Clock in"}
          </Button>
          <Button
            variant="outline"
            disabled={!canClockOut || clockOutMutation.isPending}
            onClick={() => void clockOutMutation.mutateAsync()}
          >
            {clockOutMutation.isPending ? "Đang ra…" : "Clock out"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">Lịch sử tháng này</h2>
        {historyLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có bản ghi chấm công.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vào</TableHead>
                  <TableHead>Ra</TableHead>
                  <TableHead>Phút</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{format(parseISO(row.clockIn), "dd/MM HH:mm")}</TableCell>
                    <TableCell>
                      {row.clockOut ? format(parseISO(row.clockOut), "dd/MM HH:mm") : "—"}
                    </TableCell>
                    <TableCell>{row.workedMinutes}</TableCell>
                    <TableCell>
                      {row.clockOut === null ? (
                        <Badge variant="secondary">Đang mở</Badge>
                      ) : (
                        <Badge variant="outline">Đã đóng</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
