import { format, parseISO } from "date-fns";
import { MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AttendanceResponse } from "@/types/employee";
import { OVERTIME_STATUS, type OvertimeRequestResponse } from "@/types/overtime";
import { toTime, formatMinutes, getClockInStatus } from "./attendance-utils";

interface Props {
  monthLabel: string;
  history: AttendanceResponse[];
  myOTRequests: OvertimeRequestResponse[];
  isLoading: boolean;
}

export function AttendanceHistoryTable({ history, myOTRequests, isLoading }: Props) {
  return (
    <div className="space-y-3">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có bản ghi chấm công.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Ca</TableHead>
                <TableHead>Vào ca</TableHead>
                <TableHead>Tan ca</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead>Chấm công</TableHead>
                <TableHead>Tăng ca</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((row) => {
                const status = getClockInStatus(row);
                const otRequest = myOTRequests.find(
                  (r) => r.shiftAssignmentId === row.assignmentId
                );
                return (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(parseISO(row.clockIn), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-52 items-start gap-2">
                        <span
                          className="mt-1.5 size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: row.shiftColor ?? "#5068a9" }}
                        />
                        <div>
                          <p className="font-medium">{row.shiftName ?? "Ca làm việc"}</p>
                          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              {toTime(row.scheduledStartTime)} – {toTime(row.scheduledEndTime)}
                            </span>
                            {row.locationName ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPinIcon className="size-3" />
                                {row.locationName}
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {format(parseISO(row.clockIn), "HH:mm")}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.clockOut ? format(parseISO(row.clockOut), "HH:mm") : "—"}
                    </TableCell>
                    <TableCell>{row.clockOut ? formatMinutes(row.workedMinutes) : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className={cn("border", status.className)}>
                          {status.label}
                        </Badge>
                        {row.autoClosed ? (
                          <Badge
                            variant="outline"
                            className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400"
                          >
                            Tự động đóng
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      {otRequest ? (
                        (() => {
                          const isApproved = otRequest.status === OVERTIME_STATUS.Approved;
                          const badge = (
                            <Badge
                              variant="outline"
                              className={cn(
                                "border",
                                otRequest.status === OVERTIME_STATUS.Pending &&
                                  "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                                otRequest.status === OVERTIME_STATUS.PendingApproval &&
                                  "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
                                isApproved &&
                                  "cursor-default border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
                                otRequest.status === OVERTIME_STATUS.Rejected &&
                                  "border-destructive/30 bg-destructive/10 text-destructive"
                              )}
                            >
                              {otRequest.status === OVERTIME_STATUS.Pending && "Đang mở"}
                              {otRequest.status === OVERTIME_STATUS.PendingApproval && "Chờ duyệt"}
                              {isApproved && "Đã duyệt"}
                              {otRequest.status === OVERTIME_STATUS.Rejected && "Bị từ chối"}
                            </Badge>
                          );

                          if (isApproved && otRequest.overtimeMinutes) {
                            return (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>{badge}</TooltipTrigger>
                                  <TooltipContent>
                                    Giờ OT: {formatMinutes(otRequest.overtimeMinutes)}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          }
                          return badge;
                        })()
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
