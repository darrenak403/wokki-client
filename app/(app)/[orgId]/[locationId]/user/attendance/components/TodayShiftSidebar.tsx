import { UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShiftAssignmentResponse } from "@/types/schedule";
import { toTime } from "./attendance-utils";

interface Props {
  todayShifts: ShiftAssignmentResponse[];
  activeShiftId: string | undefined;
  selectable: boolean;
  onSelect: (id: string) => void;
}

export function TodayShiftSidebar({ todayShifts, activeShiftId, selectable, onSelect }: Props) {
  return (
    <aside className="rounded-lg border bg-muted/40 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Ca trong ngày</h2>
        <UsersIcon className="size-4 text-muted-foreground" />
      </div>
      {todayShifts.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Chưa có ca hôm nay.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {todayShifts.map((shift) => {
            const active = shift.id === activeShiftId;
            return (
              <li
                key={shift.id}
                onClick={selectable ? () => onSelect(shift.id) : undefined}
                className={cn(
                  "rounded-lg border bg-card p-3 transition-colors",
                  active ? "border-primary/40" : "border-border",
                  selectable && "cursor-pointer hover:border-primary/60 hover:bg-accent/40"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate font-medium">{shift.shiftName}</p>
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      active ? "bg-primary" : "bg-muted-foreground/40"
                    )}
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {toTime(shift.startTime)} – {toTime(shift.endTime)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
