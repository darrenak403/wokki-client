"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PencilIcon, PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateLocationMutation,
  useLocationsQuery,
  useUpdateLocationMutation,
} from "@/lib/hooks/foundation/use-locations";
import type { LocationResponse } from "@/types/foundation";

const locationSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  timeZone: z.string().min(1, "Vui lòng nhập múi giờ"),
  isActive: z.boolean(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

type LocationsPanelProps = {
  canWrite?: boolean;
};

export function LocationsPanel({ canWrite = false }: LocationsPanelProps) {
  const { data: locations = [], isLoading, isError } = useLocationsQuery();
  const createMutation = useCreateLocationMutation();
  const updateMutation = useUpdateLocationMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocationResponse | null>(null);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: "",
      timeZone: "Asia/Ho_Chi_Minh",
      isActive: true,
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      address: "",
      timeZone: "Asia/Ho_Chi_Minh",
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (row: LocationResponse) => {
    setEditing(row);
    form.reset({
      name: row.name,
      address: row.address,
      timeZone: row.timeZone,
      isActive: row.isActive,
    });
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        address: values.address,
        timeZone: values.timeZone,
      });
    }
    setOpen(false);
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chi nhánh</h1>
          <p className="text-sm text-muted-foreground">
            {canWrite
              ? "Quản lý chi nhánh và múi giờ làm việc."
              : "Xem danh sách chi nhánh (chỉ đọc)."}
          </p>
        </div>
        {canWrite ? (
          <Button type="button" onClick={openCreate}>
            <PlusIcon className="size-4" />
            Thêm chi nhánh
          </Button>
        ) : null}
      </div>

      {isError ? (
        <p className="text-sm text-destructive">Không tải được danh sách chi nhánh.</p>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Múi giờ</TableHead>
            <TableHead>Trạng thái</TableHead>
            {canWrite ? <TableHead className="w-[100px]" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={canWrite ? 5 : 4} className="text-muted-foreground">
                Đang tải…
              </TableCell>
            </TableRow>
          ) : locations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={canWrite ? 5 : 4} className="text-muted-foreground">
                Chưa có chi nhánh.
                {canWrite ? " Tạo chi nhánh đầu tiên." : ""}
              </TableCell>
            </TableRow>
          ) : (
            locations.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.timeZone}</TableCell>
                <TableCell>
                  {row.isActive ? (
                    <Badge variant="secondary">Hoạt động</Badge>
                  ) : (
                    <Badge variant="outline">Ngưng hoạt động</Badge>
                  )}
                </TableCell>
                {canWrite ? (
                  <TableCell>
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row)}>
                      <PencilIcon className="size-4" />
                      Sửa
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa chi nhánh" : "Thêm chi nhánh"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="loc-name">Tên</FieldLabel>
                <Input id="loc-name" {...form.register("name")} />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="loc-address">Địa chỉ</FieldLabel>
                <Input id="loc-address" {...form.register("address")} />
                <FieldError errors={[form.formState.errors.address]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="loc-tz">Múi giờ</FieldLabel>
                <Input id="loc-tz" {...form.register("timeZone")} />
                <FieldError errors={[form.formState.errors.timeZone]} />
              </Field>
              {editing ? (
                <Field className="flex flex-row items-center justify-between gap-4">
                  <FieldLabel htmlFor="loc-active">Đang hoạt động</FieldLabel>
                  <Switch
                    id="loc-active"
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                  />
                </Field>
              ) : null}
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Đang lưu…" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
