"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateUserMutation, useUsersQuery } from "@/hooks/useUsers";
import { APP_ROLES, type AppRole } from "@/lib/types/roles";

const userSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  role: z.enum(["Admin", "Manager", "User"] as [AppRole, AppRole, AppRole]),
});

export function UsersPanel() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useUsersQuery({ page, pageSize: 10 });
  const createMutation = useCreateUserMutation();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: "", password: "", role: "User" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createMutation.mutateAsync(values);
    setOpen(false);
    form.reset();
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-end gap-4">
        <Button type="button" onClick={() => setOpen(true)}>
          <PlusIcon className="size-4" />
          Thêm tài khoản
        </Button>
      </div>

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
                    <TableCell>
                      {new Date(row.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm tài khoản hệ thống</DialogTitle>
            <DialogDescription>
              Không tạo Employee. Để nhân viên có ca, dùng màn Nhân sự.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" {...form.register("email")} />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>
              <Field>
                <FieldLabel>Mật khẩu</FieldLabel>
                <Input type="password" {...form.register("password")} />
                <FieldError errors={[form.formState.errors.password]} />
              </Field>
              <Field>
                <FieldLabel>Vai trò</FieldLabel>
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(v) => { if (v !== null) field.onChange(v); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APP_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Tạo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
