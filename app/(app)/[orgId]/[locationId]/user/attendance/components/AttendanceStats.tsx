import { formatMinutes } from "./attendance-utils";

interface Props {
  historyCount: number;
  totalWorkedMinutes: number;
  openRecordCount: number;
}

export function AttendanceStats({ historyCount, totalWorkedMinutes, openRecordCount }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">Số ca làm tháng này</p>
        <p className="mt-2 text-2xl font-semibold">{historyCount}</p>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">Tổng giờ đã đóng</p>
        <p className="mt-2 text-2xl font-semibold">{formatMinutes(totalWorkedMinutes)}</p>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">Bản ghi đang mở</p>
        <p className="mt-2 text-2xl font-semibold">{openRecordCount}</p>
      </div>
    </div>
  );
}
