"use client";

import { ArrowRightLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import type { EmployeeResponse } from "@/types/foundation";

type WorkspaceEmployeesPanelProps = {
  locationId: string | null;
  departmentId?: string | null;
  enabled?: boolean;
  canTransfer?: boolean;
  onTransfer?: (employee: EmployeeResponse) => void;
  onEmployeeClick?: (employee: EmployeeResponse) => void;
  showDepartmentColumn?: boolean;
};

function employeeDisplayName(emp: EmployeeResponse): string {
  return `${emp.firstName} ${emp.lastName}`.trim() || emp.email;
}

export function WorkspaceEmployeesPanel({
  locationId,
  departmentId,
  enabled = true,
  canTransfer = false,
  onTransfer,
  onEmployeeClick,
  showDepartmentColumn = false,
}: WorkspaceEmployeesPanelProps) {
  const { data, isLoading, isError } = useEmployeesQuery(
    {
      locationId: locationId ?? "",
      departmentId: departmentId ?? undefined,
      page: 1,
      pageSize: 100,
      includeTerminated: false,
    },
    { enabled: enabled && Boolean(locationId) }
  );

  const employees = enabled ? (data?.items ?? []) : [];
  const totalCount = enabled ? (data?.totalCount ?? employees.length) : 0;

  if (!locationId) {
    return <p className="text-sm text-muted-foreground">Chưa chọn chi nhánh.</p>;
  }

  if (!enabled) return null;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Không tải được danh sách nhân viên.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalCount}</span> nhân viên
          {departmentId ? " trong phòng ban này" : " tại chi nhánh này"}
        </p>
        <Badge variant="secondary">{totalCount}</Badge>
      </div>

      {employees.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Chưa có nhân viên{departmentId ? " trong phòng ban này" : " tại chi nhánh này"}.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                {showDepartmentColumn ? <TableHead>Phòng ban</TableHead> : null}
                <TableHead>Chức vụ</TableHead>
                <TableHead>Email</TableHead>
                {canTransfer ? <TableHead className="w-[100px] text-right">Thao tác</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow
                  key={emp.id}
                  className={onEmployeeClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                  onClick={onEmployeeClick ? () => onEmployeeClick(emp) : undefined}
                >
                  <TableCell className="font-medium">{employeeDisplayName(emp)}</TableCell>
                  {showDepartmentColumn ? (
                    <TableCell className="text-muted-foreground">
                      {emp.departmentName ?? "—"}
                    </TableCell>
                  ) : null}
                  <TableCell className="text-muted-foreground">{emp.position || "—"}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-muted-foreground">
                    {emp.email}
                  </TableCell>
                  {canTransfer && onTransfer ? (
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onTransfer(emp);
                        }}
                      >
                        <ArrowRightLeftIcon className="size-3.5" />
                        Chuyển
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalCount > employees.length ? (
        <p className="text-xs text-muted-foreground">
          Hiển thị {employees.length}/{totalCount} nhân viên. Xem đầy đủ tại mục Nhân sự.
        </p>
      ) : null}
    </div>
  );
}
