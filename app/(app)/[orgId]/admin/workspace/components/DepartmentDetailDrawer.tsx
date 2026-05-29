"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRightLeftIcon } from "lucide-react";
import { TransferEmployeeDialog } from "@/app/(app)/[orgId]/admin/workspace/components/TransferEmployeeDialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/hooks/useDepartments";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { writeFoundationSession } from "@/lib/support/foundation/session-context";
import type { DepartmentResponse, EmployeeResponse, LocationResponse } from "@/types/foundation";

const departmentSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên phòng ban"),
  isActive: z.boolean(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

type DepartmentDetailDrawerProps = {
  department: DepartmentResponse | null;
  location: LocationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite?: boolean;
  /** Chỉnh sửa phòng ban hiện có (tên khi không có canWrite). */
  canEdit?: boolean;
  canTransferEmployees?: boolean;
  isCreate?: boolean;
  onSaved?: () => void;
};

export function DepartmentDetailDrawer({
  department,
  location,
  open,
  onOpenChange,
  canWrite = false,
  canEdit = false,
  canTransferEmployees = false,
  isCreate = false,
  onSaved,
}: DepartmentDetailDrawerProps) {
  const locationId = location?.id ?? department?.locationId ?? null;
  const createMutation = useCreateDepartmentMutation(locationId);
  const updateMutation = useUpdateDepartmentMutation(locationId);
  const [transferEmployee, setTransferEmployee] = useState<EmployeeResponse | null>(null);

  const { data: employeesPage } = useEmployeesQuery({
    locationId: locationId ?? "",
    departmentId: department?.id,
    page: 1,
    pageSize: 50,
    includeTerminated: false,
  });
  const employees = employeesPage?.items ?? [];

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", isActive: true },
  });

  useEffect(() => {
    if (!open) return;
    if (locationId && department) {
      writeFoundationSession({
        selectedLocationId: locationId,
        selectedDepartmentId: department.id,
      });
    }
    if (isCreate || !department) {
      form.reset({ name: "", isActive: true });
      return;
    }
    form.reset({ name: department.name, isActive: department.isActive });
  }, [open, department, isCreate, locationId, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!locationId) return;
    if (isCreate || !department) {
      await createMutation.mutateAsync({ locationId, name: values.name });
    } else if (canWrite) {
      await updateMutation.mutateAsync({ id: department.id, data: values });
    } else {
      await updateMutation.mutateAsync({
        id: department.id,
        data: { name: values.name, isActive: department.isActive },
      });
    }
    onSaved?.();
    onOpenChange(false);
  });

  const pending = createMutation.isPending || updateMutation.isPending;
  const canSave = isCreate ? canWrite : canWrite || canEdit;
  const nameReadOnly = !canWrite && !canEdit;
  const detailsReadOnly = !canWrite;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {isCreate ? "Thêm phòng ban" : department?.name ?? "Phòng ban"}
            </SheetTitle>
            <SheetDescription>
              {location
                ? canSave && !canWrite
                  ? `Thuộc chi nhánh ${location.name}. Chỉnh sửa tên phòng ban trong phạm vi quản lý.`
                  : `Thuộc chi nhánh ${location.name}.`
                : "Chọn chi nhánh trên sơ đồ trước."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={onSubmit} className="flex flex-col gap-6 px-4 pb-4" noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ws-dept-name">Tên phòng ban</FieldLabel>
                <Input
                  id="ws-dept-name"
                  readOnly={nameReadOnly}
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              {!isCreate && department ? (
                <Field className="flex flex-row items-center justify-between gap-4">
                  <FieldLabel htmlFor="ws-dept-active">Đang hoạt động</FieldLabel>
                  <Switch
                    id="ws-dept-active"
                    disabled={detailsReadOnly}
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                  />
                </Field>
              ) : null}
            </FieldGroup>

            {!isCreate && department && employees.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Nhân viên ({employees.length})</p>
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2 text-sm">
                  {employees.map((emp) => (
                    <li key={emp.id} className="flex items-center justify-between gap-2">
                      <span>
                        {emp.firstName} {emp.lastName}
                      </span>
                      {canTransferEmployees ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setTransferEmployee(emp)}
                        >
                          <ArrowRightLeftIcon className="size-3.5" />
                          Chuyển
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {canSave ? (
              <SheetFooter className="px-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={pending || !locationId}>
                  {pending ? "Đang lưu…" : "Lưu"}
                </Button>
              </SheetFooter>
            ) : null}
          </form>
        </SheetContent>
      </Sheet>

      {transferEmployee ? (
        <TransferEmployeeDialog
          employee={transferEmployee}
          open={transferEmployee !== null}
          onOpenChange={(next) => {
            if (!next) setTransferEmployee(null);
          }}
        />
      ) : null}
    </>
  );
}
