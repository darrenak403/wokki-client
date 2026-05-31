"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckIcon, CopyIcon, PlusIcon } from "lucide-react";
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
import { DepartmentScopeChips } from "@/components/shared/department-scope-chips";
import { CopyShiftsDialog } from "./CopyShiftsDialog";
import { ShiftEmployeesDialog } from "./ShiftEmployeesDialog";
import { ShiftRowActions } from "./ShiftRowActions";
import { useDepartmentsQuery } from "@/hooks/useDepartments";
import { useEmployeesQuery } from "@/hooks/useEmployees";

import {
  useCreateShiftMutation,
  useDeactivateShiftMutation,
  useShiftsQuery,
  useUpdateShiftMutation,
} from "@/hooks/useShifts";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { ROLE_USER } from "@/lib/types/roles";
import { getShiftEligibleEmployees } from "@/lib/support/shift/shift-eligible-employees";
import { cn } from "@/lib/utils";
import type { ShiftDefinitionResponse } from "@/types/foundation";

function compareShiftsForDisplay(
  left: ShiftDefinitionResponse,
  right: ShiftDefinitionResponse,
): number {
  const leftStart = toApiTime(toTimeInput(left.startTime));
  const rightStart = toApiTime(toTimeInput(right.startTime));
  if (leftStart !== rightStart) return leftStart.localeCompare(rightStart);
  return left.name.localeCompare(right.name, "vi");
}

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
  const { session, setDepartmentId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;

  const listParams = useMemo(
    () => (locationId && departmentId ? { locationId, departmentId } : null),
    [locationId, departmentId],
  );

  const { data: shifts = [], isLoading, isError } = useShiftsQuery(listParams);
  const { data: departments = [] } = useDepartmentsQuery(locationId);
  const { data: employeesPage } = useEmployeesQuery(
    { departmentId: departmentId ?? undefined, pageSize: 200 },
    { enabled: Boolean(departmentId) },
  );
  const departmentEmployees = useMemo(
    () => (employeesPage?.items ?? []).filter((employee) => !employee.terminatedAt),
    [employeesPage],
  );
  const createMutation = useCreateShiftMutation(listParams);
  const updateMutation = useUpdateShiftMutation(listParams);
  const deactivateMutation = useDeactivateShiftMutation(listParams);

  const [open, setOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftDefinitionResponse | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [employeesDialogShift, setEmployeesDialogShift] =
    useState<ShiftDefinitionResponse | null>(null);

  useEffect(() => {
    setCopyOpen(false);
  }, [departmentId]);

  useEffect(() => {
    if (!locationId || departmentId || departments.length === 0) return;
    const firstActive = departments.find((dept) => dept.isActive) ?? departments[0];
    if (firstActive) setDepartmentId(firstActive.id);
  }, [departmentId, departments, locationId, setDepartmentId]);

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
  const selectedColor = useWatch({ control: form.control, name: "color" });
  const selectedIsActive = useWatch({ control: form.control, name: "isActive" });

  const openCreate = () => {
    if (!locationId || !departmentId) return;
    setEditing(null);
    form.reset({
      name: "",
      startTime: "08:00",
      endTime: "16:00",
      requiredRole: ROLE_USER,
      color: "#3B82F6",
      isActive: true,
      departmentId,
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
    if (!locationId || !departmentId) return;
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
        departmentId,
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

  const sourceDepartmentName =
    departments.find((dept) => dept.id === departmentId)?.name ?? "Phòng ban hiện tại";

  const sortedShifts = useMemo(
    () => [...shifts].sort(compareShiftsForDisplay),
    [shifts],
  );

  const openCopy = () => {
    if (!departmentId) {
      toast.error("Chọn phòng ban nguồn trước khi sao chép ca.");
      return;
    }
    setCopyOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 border-b pb-4">
        <DepartmentScopeChips
          locationId={locationId}
          value={departmentId}
          onChange={setDepartmentId}
          allowAll={false}
          maxVisible={5}
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" onClick={openCreate} disabled={!locationId || !departmentId}>
            <PlusIcon className="size-4" />
            Thêm ca
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={openCopy}
            disabled={!locationId || !departmentId}
          >
            <CopyIcon className="size-4" />
            Sao chép ca
          </Button>
        </div>
      </div>

      {!locationId ? (
        <p className="text-sm text-muted-foreground">Chọn chi nhánh trước.</p>
      ) : departments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có phòng ban trong chi nhánh này.</p>
      ) : !departmentId ? (
        <p className="text-sm text-muted-foreground">Chọn phòng ban để xem ca làm việc.</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Không tải được danh sách ca.</p>
      ) : (
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[30%]">Tên ca</TableHead>
              <TableHead className="w-[28%]">Giờ</TableHead>
              <TableHead className="w-[12%] text-center">Số lượng</TableHead>
              <TableHead className="w-[20%]">Trạng thái</TableHead>
              <TableHead className="w-[72px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : sortedShifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Chưa có ca làm việc cho phòng ban này.
                </TableCell>
              </TableRow>
            ) : (
              sortedShifts.map((row) => {
                const eligibleCount = getShiftEligibleEmployees(row, departmentEmployees).length;

                return (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => setEmployeesDialogShift(row)}
                >
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      {row.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {toTimeInput(row.startTime)} – {toTimeInput(row.endTime)}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{eligibleCount}</TableCell>

                  <TableCell>
                    {row.isActive ? (
                      <Badge variant="secondary">Hoạt động</Badge>
                    ) : (
                      <Badge variant="outline">Ngưng</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ShiftRowActions
                      shift={row}
                      onEdit={() => openEdit(row)}
                      onDeactivate={() => setDeactivateId(row.id)}
                    />
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      <ShiftEmployeesDialog
        open={employeesDialogShift != null}
        onOpenChange={(next) => {
          if (!next) setEmployeesDialogShift(null);
        }}
        shift={employeesDialogShift}
        employees={departmentEmployees}
      />

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

      {locationId && departmentId && listParams ? (
        <CopyShiftsDialog
          open={copyOpen}
          onOpenChange={setCopyOpen}
          locationId={locationId}
          sourceDepartmentId={departmentId}
          sourceDepartmentName={sourceDepartmentName}
          activeShifts={shifts}
          listParams={listParams}
        />
      ) : null}
    </div>
  );
}
