"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCancelLeaveRequestMutation,
  useCreateLeaveRequestMutation,
  useMyLeaveRequestsQuery,
} from "@/hooks/useScheduleLeaveRequests";
import { weekDayDates } from "@/lib/support/schedule/week";

type MyLeaveRequestTabProps = {
  scheduleId: string;
  weekStartDate: string;
  shifts: Array<{ id: string; name: string }>;
  scheduleIsDraft: boolean;
};

export function MyLeaveRequestTab({
  scheduleId,
  weekStartDate,
  shifts,
  scheduleIsDraft,
}: MyLeaveRequestTabProps) {
  const weekDates = useMemo(() => weekDayDates(weekStartDate), [weekStartDate]);
  const { data: mine = [] } = useMyLeaveRequestsQuery(scheduleId);
  const createMutation = useCreateLeaveRequestMutation(scheduleId);
  const cancelMutation = useCancelLeaveRequestMutation(scheduleId);

  const [shiftId, setShiftId] = useState(shifts[0]?.id ?? "");
  const [date, setDate] = useState(weekDates[0] ?? "");
  const [reason, setReason] = useState("");

  if (!scheduleIsDraft) {
    return (
      <p className="text-sm text-muted-foreground">
        Lịch tuần này đã công bố — không thể gửi đơn xin nghỉ qua form. Liên hệ quản lý nếu cần.
      </p>
    );
  }

  const handleSubmit = async () => {
    if (!shiftId || !date || !reason.trim()) return;
    await createMutation.mutateAsync({
      scheduleId,
      shiftDefinitionId: shiftId,
      date,
      reason: reason.trim(),
    });
    setReason("");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Ca</Label>
          <Select value={shiftId} onValueChange={(v) => v && setShiftId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn ca">
                {(v: string) => shifts.find((s) => s.id === v)?.name ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {shifts.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Ngày</Label>
          <Select value={date} onValueChange={(v) => v && setDate(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn ngày">
                {(v: string) => (v ? format(parseISO(v), "dd/MM/yyyy") : v)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {weekDates.map((d) => (
                <SelectItem key={d} value={d}>
                  {format(parseISO(d), "dd/MM/yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Lý do</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Ví dụ: việc gia đình…"
          />
        </div>
        <div className="sm:col-span-2">
          <Button
            disabled={createMutation.isPending || !reason.trim() || !shiftId}
            onClick={() => void handleSubmit()}
          >
            {createMutation.isPending ? "Đang gửi…" : "Gửi đơn xin nghỉ"}
          </Button>
        </div>
      </div>

      {mine.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Đơn của bạn</p>
          <ul className="space-y-2">
            {mine.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <span className="min-w-0 break-words">
                  {item.shiftName} · {format(parseISO(item.date), "dd/MM")} —{" "}
                  <span className="text-muted-foreground">{item.status}</span>
                </span>
                {item.status === "Pending" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={cancelMutation.isPending}
                    onClick={() => void cancelMutation.mutateAsync(item.id)}
                  >
                    Huỷ
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
