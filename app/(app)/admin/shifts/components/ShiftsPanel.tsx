"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  useCreateShiftMutation,
  useDeactivateShiftMutation,
  useShiftsQuery,
  useUpdateShiftMutation,
} from "@/hooks/useShifts";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { ROLE_USER } from "@/lib/types/roles";
import { cn } from "@/lib/utils";
import type { ShiftDefinitionResponse } from "@/types/foundation";

function toTimeInput(value: string): string {
  return value?.slice(0, 5) ?? "";
}

function toApiTime(value: string): string {
  if (!value) return "00:00:00";
  return value.length === 5 ? `${value}:00` : value;
}

const shiftSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập tên ca"),
    startTime: z.string().min(1, "Vui lòng nhập giờ bắt đầu"),
    endTime: z.string().min(1, "Vui lòng nhập giờ kết thúc"),
    requiredRole: z.string().min(1),
    color: z.string().min(1),
    isActive: z.boolean(),
    departmentId: z.string().optional(),
  })
  .refine((data) => toApiTime(data.startTime) < toApiTime(data.endTime), {
    message: "Giờ kết thúc phải sau giờ bắt đầu",
    path: ["endTime"],
  });

type ShiftFormValues = z.infer<typeof shiftSchema>;

const SHIFT_COLOR_OPTIONS = [
  { label: "Xanh dương", value: "#3B82F6" },
  { label: "Xanh lá", value: "#22C55E" },
  { label: "Tím", value: "#8B5CF6" },
  { label: "Hồng", value: "#EC4899" },
  { label: "Cam", value: "#F97316" },
  { label: "Vàng", value: "#EAB308" },
  { label: "Xanh ngọc", value: "#14B8A6" },
  { label: "Đỏ", value: "#EF4444" },
] as const;

export function ShiftsPanel() {
  const { session, setLocationId, setDepartmentId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;

  const listParams = useMemo(
    () => (locationId ? { locationId, departmentId: departmentId ?? undefined } : null),
    [locationId, departmentId]
  );

  const { data: shifts = [], isLoading, isError } = useShiftsQuery(listParams);
  const createMutation = useCreateShiftMutation(listParams);
  const updateMutation = useUpdateShiftMutation(listParams);
  const deactivateMutation = useDeactivateShiftMutation(listParams);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftDefinitionResponse | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: "",
      startTime: "08:00",
      endTime: "16:00",
      requiredRole: ROLE_USER,
      color: "#3B82F6",
      isActive: true,
      departmentId: "",
    },
  });
  const selectedFormDepartmentId = useWatch({ control: form.control, name: "departmentId" });
  const selectedColor = useWatch({ control: form.control, name: "color" });
  const selectedIsActive = useWatch({ control: form.control, name: "isActive" });

  const openCreate = () => {
    if (!locationId) return;
    setEditing(null);
    form.reset({
      name: "",
      startTime: "08:00",
      endTime: "16:00",
      requiredRole: ROLE_USER,
      color: "#3B82F6",
      isActive: true,
      departmentId: departmentId ?? "",
    });
    setOpen(true);
  };

  const openEdit = (row: ShiftDefinitionResponse) => {
    setEditing(row);
    form.reset({
      name: row.name,
      startTime: toTimeInput(row.startTime),
      endTime: toTimeInput(row.endTime),
      requiredRole: row.requiredRole,
      color: row.color,
      isActive: row.isActive,
      departmentId: row.departmentId ?? "",
    });
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!locationId) return;
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: {
          name: values.name,
          startTime: toApiTime(values.startTime),
          endTime: toApiTime(values.endTime),
          requiredRole: values.requiredRole,
          color: values.color,
          isActive: values.isActive,
        },
      });
    } else {
      await createMutation.mutateAsync({
        locationId,
        ...(values.departmentId ? { departmentId: values.departmentId } : {}),
        name: values.name,
        startTime: toApiTime(values.startTime),
        endTime: toApiTime(values.endTime),
        requiredRole: values.requiredRole,
        color: values.color,
      });
    }
    setOpen(false);
  });

  const pending =
    createMutation.isPending || updateMutation.isPending || deactivateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ca làm việc</h1>
          <p className="text-sm text-muted-foreground">
            Định nghĩa ca sáng, chiều, tối trước khi xếp lịch tuần.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={!locationId}>
          <PlusIcon className="size-4" />
          Thêm ca
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Chi nhánh</span>
          <LocationSelect value={locationId} onChange={setLocationId} required />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Phòng ban</span>
          <DepartmentSelect
            locationId={locationId}
            value={departmentId}
            onChange={setDepartmentId}
            allowEmpty
          />
        </div>
      </div>

      {!locationId ? (
        <p className="text-sm text-muted-foreground">Chọn chi nhánh trước.</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Không tải được danh sách ca.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên ca</TableHead>
              <TableHead>Giờ</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[140px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Chưa có ca làm việc tại chi nhánh này.
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <span
                      className="mr-2 inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    {row.name}
                  </TableCell>
                  <TableCell>
                    {toTimeInput(row.startTime)} – {toTimeInput(row.endTime)}
                  </TableCell>
                  <TableCell>{row.requiredRole}</TableCell>
                  <TableCell>
                    {row.isActive ? (
                      <Badge variant="secondary">Hoạt động</Badge>
                    ) : (
                      <Badge variant="outline">Ngưng</Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row)}>
                      <PencilIcon className="size-4" />
                      Sửa
                    </Button>
                    {row.isActive ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeactivateId(row.id)}
                      >
                        <Trash2Icon className="size-4" />
                        Ngưng
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa ca làm việc" : "Thêm ca làm việc"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="shift-name">Tên ca</FieldLabel>
                <Input id="shift-name" {...form.register("name")} />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              {!editing ? (
                <Field>
                  <FieldLabel>Phòng ban (tuỳ chọn)</FieldLabel>
                  <DepartmentSelect
                    locationId={locationId}
                    value={selectedFormDepartmentId || null}
                    onChange={(id) => form.setValue("departmentId", id ?? "")}
                    allowEmpty
                  />
                </Field>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="shift-start">Bắt đầu</FieldLabel>
                  <Input id="shift-start" type="time" {...form.register("startTime")} />
                  <FieldError errors={[form.formState.errors.startTime]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="shift-end">Kết thúc</FieldLabel>
                  <Input id="shift-end" type="time" {...form.register("endTime")} />
                  <FieldError errors={[form.formState.errors.endTime]} />
                </Field>
              </div>
              <Field>
                <FieldLabel>Màu</FieldLabel>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {SHIFT_COLOR_OPTIONS.map((color) => {
                    const selected = selectedColor === color.value;

                    return (
                      <button
                        key={color.value}
                        type="button"
                        aria-label={color.label}
                        aria-pressed={selected}
                        title={color.label}
                        className={cn(
                          "flex aspect-square min-h-10 items-center justify-center rounded-lg border bg-background p-1 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                          selected ? "border-foreground" : "border-input hover:border-foreground/40"
                        )}
                        onClick={() =>
                          form.setValue("color", color.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        <span
                          className="flex size-full items-center justify-center rounded-md"
                          style={{ backgroundColor: color.value }}
                        >
                          {selected ? (
                            <CheckIcon className="size-4 text-white drop-shadow" />
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <FieldError errors={[form.formState.errors.color]} />
              </Field>
              {editing ? (
                <Field className="flex flex-row items-center justify-between gap-4">
                  <FieldLabel htmlFor="shift-active">Đang hoạt động</FieldLabel>
                  <Switch
                    id="shift-active"
                    checked={selectedIsActive}
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

      <AlertDialog open={Boolean(deactivateId)} onOpenChange={() => setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ngưng ca làm việc?</AlertDialogTitle>
            <AlertDialogDescription>
              Ca sẽ không dùng khi xếp lịch mới. Bạn có thể tạo ca khác sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deactivateId) await deactivateMutation.mutateAsync(deactivateId);
                setDeactivateId(null);
              }}
            >
              Ngưng ca
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
