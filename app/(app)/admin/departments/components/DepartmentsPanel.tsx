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
import { DepartmentSelect } from "@/components/shared/department-select";
import { LocationSelect } from "@/components/shared/location-select";
import {
  useCreateDepartmentMutation,
  useDepartmentsQuery,
  useUpdateDepartmentMutation,
} from "@/hooks/useDepartments";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import type { DepartmentResponse } from "@/types/foundation";

const departmentSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên phòng ban"),
  isActive: z.boolean(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

type DepartmentsPanelProps = {
  canWrite?: boolean;
};

export function DepartmentsPanel({ canWrite = false }: DepartmentsPanelProps) {
  const { session, setLocationId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const { data: departments = [], isLoading, isError } = useDepartmentsQuery(locationId);
  const createMutation = useCreateDepartmentMutation(locationId);
  const updateMutation = useUpdateDepartmentMutation(locationId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentResponse | null>(null);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", isActive: true },
  });

  const openCreate = () => {
    if (!locationId) return;
    setEditing(null);
    form.reset({ name: "", isActive: true });
    setOpen(true);
  };

  const openEdit = (row: DepartmentResponse) => {
    setEditing(row);
    form.reset({ name: row.name, isActive: row.isActive });
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!locationId) return;
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values });
    } else {
      await createMutation.mutateAsync({ locationId, name: values.name });
    }
    setOpen(false);
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-end gap-4">
        {canWrite ? (
          <Button type="button" onClick={openCreate} disabled={!locationId}>
            <PlusIcon className="size-4" />
            Thêm phòng ban
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Chi nhánh</span>
        <LocationSelect value={locationId} onChange={setLocationId} />
      </div>

      {!locationId ? (
        <p className="text-sm text-muted-foreground">Chọn chi nhánh trước.</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Không tải được danh sách phòng ban.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên phòng ban</TableHead>
              <TableHead>Trạng thái</TableHead>
              {canWrite ? <TableHead className="w-[100px]" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 3 : 2} className="text-muted-foreground">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 3 : 2} className="text-muted-foreground">
                  Chưa có phòng ban tại chi nhánh này.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
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
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa phòng ban" : "Thêm phòng ban"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="dept-name">Tên phòng ban</FieldLabel>
                <Input id="dept-name" {...form.register("name")} />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              {editing ? (
                <Field className="flex flex-row items-center justify-between gap-4">
                  <FieldLabel htmlFor="dept-active">Đang hoạt động</FieldLabel>
                  <Switch
                    id="dept-active"
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
