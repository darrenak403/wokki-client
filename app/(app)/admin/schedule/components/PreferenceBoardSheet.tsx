"use client";

import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PreferenceTypeCell } from "@/components/shared/admin/preference-type-cell";
import { usePreferenceBoardQuery } from "@/hooks/usePreferenceBoard";
import { weekDayDates } from "@/lib/support/schedule/week";
import type { SchedulePreferenceBoardResponse } from "@/types/schedule-preferences";

function findCell(
  board: SchedulePreferenceBoardResponse,
  employeeId: string,
  shiftDefinitionId: string,
  date: string,
) {
  const row = board.employees.find((e) => e.employeeId === employeeId);
  return (
    row?.cells.find(
      (c) => c.shiftDefinitionId === shiftDefinitionId && c.date === date,
    )?.preferenceType ?? null
  );
}

type PreferenceBoardSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string;
};

export function PreferenceBoardSheet({
  open,
  onOpenChange,
  scheduleId,
}: PreferenceBoardSheetProps) {
  const { data: board, isLoading, isError } = usePreferenceBoardQuery(scheduleId, open);

  const weekDays = board ? weekDayDates(board.weekStartDate) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>Bảng đăng ký ca</SheetTitle>
          <SheetDescription>
            {board
              ? `${board.submittedCount}/${board.employeeCount} nhân viên đã gửi · chỉ xem (NV tự sửa trên Lịch của tôi).`
              : "Theo dõi đăng ký ca mong muốn của phòng ban."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 py-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải bảng…</p>
          ) : isError ? (
            <p className="text-sm text-destructive">Không tải được bảng đăng ký.</p>
          ) : !board ? null : (
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 min-w-[140px] bg-background">
                      Nhân viên
                    </TableHead>
                    {board.shifts.map((shift) =>
                      weekDays.map((date) => (
                        <TableHead
                          key={`${shift.shiftDefinitionId}-${date}`}
                          className="min-w-[72px] text-center text-xs"
                        >
                          <div className="font-medium">{shift.shiftName}</div>
                          <div className="text-muted-foreground">
                            {format(parseISO(date), "EEE dd/MM", { locale: vi })}
                          </div>
                        </TableHead>
                      )),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {board.employees.map((emp) => (
                    <TableRow key={emp.employeeId}>
                      <TableCell className="sticky left-0 z-10 bg-background">
                        <div className="font-medium">{emp.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{emp.position}</div>
                        {emp.status ? (
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {emp.status === "Submitted" ? "Đã gửi" : "Nháp"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            Chưa đăng ký
                          </Badge>
                        )}
                      </TableCell>
                      {board.shifts.map((shift) =>
                        weekDays.map((date) => (
                          <TableCell
                            key={`${emp.employeeId}-${shift.shiftDefinitionId}-${date}`}
                            className="text-center"
                          >
                            <PreferenceTypeCell
                              type={findCell(board, emp.employeeId, shift.shiftDefinitionId, date)}
                              compact
                            />
                          </TableCell>
                        )),
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
