"use client";

import { useState } from "react";
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
import { useUsersQuery } from "@/hooks/useUsers";

interface UsersPanelProps {
  withoutEmployee?: boolean;
}

export function UsersPanel({ withoutEmployee }: UsersPanelProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useUsersQuery({ page, pageSize: 10, withoutEmployee });
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Danh sách tài khoản đăng nhập trong org. Staff và Manager mới phải được tạo từ màn
        Nhân sự để có hồ sơ Employee, phòng ban và chi nhánh active.
      </p>

      {isError ? (
        <p className="text-sm text-destructive">Không tải được danh sách tài khoản.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3}>Đang tải…</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    Chưa có tài khoản.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.role}</Badge>
                    </TableCell>
                    <TableCell>{new Date(row.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
