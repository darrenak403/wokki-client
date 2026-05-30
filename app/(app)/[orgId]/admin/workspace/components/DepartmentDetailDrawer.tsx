"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2Icon, LayersIcon, UsersIcon } from "lucide-react";
import {
  EmployeeProfileDialog,
  type EmployeeProfileSection,
} from "@/app/(app)/[orgId]/admin/workspace/components/EmployeeProfileDialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  SettingsDialogLayout,
  SimpleFormDialog,
  type SettingsDialogNavItem,
} from "@/components/shared/settings-dialog-layout";
import { WorkspaceEmployeesPanel } from "@/components/shared/workspace-employees-panel";
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
type DepartmentSection = "general" | "employees";

type DepartmentDetailDrawerProps = {
  department: DepartmentResponse | null;
  location: LocationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite?: boolean;
  canEdit?: boolean;
  canTransferEmployees?: boolean;
  isCreate?: boolean;
  onSaved?: () => void;
};

const PANEL_PADDING = "px-6 py-5";

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
  const [activeSection, setActiveSection] = useState<DepartmentSection>("general");
  const [profileEmployee, setProfileEmployee] = useState<EmployeeResponse | null>(null);
  const [profileSection, setProfileSection] = useState<EmployeeProfileSection>("profile");

  const { data: employeesPage } = useEmployeesQuery(
    {
      locationId: locationId ?? "",
      departmentId: department?.id,
      page: 1,
      pageSize: 1,
      includeTerminated: false,
    },
    { enabled: open && Boolean(locationId && department?.id) && !isCreate }
  );
  const employeeCount = employeesPage?.totalCount ?? 0;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", isActive: true },
  });

  useEffect(() => {
    if (!open) return;
    setActiveSection("general");
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

  const navItems = useMemo((): SettingsDialogNavItem<DepartmentSection>[] => {
    const items: SettingsDialogNavItem<DepartmentSection>[] = [
      { id: "general", label: "Thông tin chung", icon: LayersIcon },
    ];
    if (department && !isCreate) {
      items.push({
        id: "employees",
        label: "Nhân viên",
        icon: UsersIcon,
        badge: employeeCount > 0 ? employeeCount : undefined,
      });
    }
    return items;
  }, [department, isCreate, employeeCount]);

  const saveFooter = canSave ? (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
        Hủy
      </Button>
      <Button type="submit" form="department-settings-form" disabled={pending || !locationId}>
        {pending ? "Đang lưu…" : "Lưu"}
      </Button>
    </div>
  ) : null;

  if (isCreate) {
    return (
      <SimpleFormDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Thêm phòng ban"
        description={
          location
            ? `Tạo phòng ban mới thuộc chi nhánh ${location.name}.`
            : "Chọn chi nhánh trên sơ đồ trước."
        }
        footer={
          canWrite ? (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                form="department-create-form"
                disabled={pending || !locationId}
              >
                {pending ? "Đang tạo…" : "Tạo phòng ban"}
              </Button>
            </div>
          ) : null
        }
      >
        <form id="department-create-form" onSubmit={onSubmit} className="space-y-4" noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ws-dept-create-name">Tên phòng ban</FieldLabel>
              <Input id="ws-dept-create-name" {...form.register("name")} />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>
          </FieldGroup>
        </form>
      </SimpleFormDialog>
    );
  }

  return (
    <>
      <SettingsDialogLayout
        open={open}
        onOpenChange={onOpenChange}
        title={department?.name ?? "Phòng ban"}
        description="Cài đặt phòng ban và nhân viên thuộc phòng ban."
        initialSection="general"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        navItems={navItems}
        headerMeta={
          department && location ? (
            <div className="rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-start gap-2">
                <LayersIcon className="mt-0.5 size-4 shrink-0 text-[#4C88C6]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                    {department.name}
                  </p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Building2Icon className="size-3 shrink-0" />
                    {location.name}
                  </p>
                </div>
              </div>
            </div>
          ) : null
        }
        footer={activeSection === "general" ? saveFooter : undefined}
      >
        {activeSection === "general" ? (
          <div className={PANEL_PADDING}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Thông tin chung</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {location
                  ? canSave && !canWrite
                    ? `Thuộc chi nhánh ${location.name}. Chỉnh sửa tên phòng ban trong phạm vi quản lý.`
                    : `Thuộc chi nhánh ${location.name}.`
                  : "Chọn chi nhánh trên sơ đồ trước."}
              </p>
            </div>
            <form
              id="department-settings-form"
              onSubmit={onSubmit}
              className="space-y-4"
              noValidate
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="ws-dept-name">Tên phòng ban</FieldLabel>
                  <Input id="ws-dept-name" readOnly={nameReadOnly} {...form.register("name")} />
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>
                {department ? (
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
            </form>
          </div>
        ) : null}

        {activeSection === "employees" && department && locationId ? (
          <div className={PANEL_PADDING}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Nhân viên</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Nhân viên đang làm việc tại phòng ban {department.name}.
              </p>
            </div>
            <WorkspaceEmployeesPanel
              locationId={locationId}
              departmentId={department.id}
              enabled={activeSection === "employees"}
              canTransfer={canTransferEmployees}
              onEmployeeClick={(emp) => {
                setProfileSection("profile");
                setProfileEmployee(emp);
              }}
              onTransfer={(emp) => {
                setProfileSection("transfer");
                setProfileEmployee(emp);
              }}
            />
          </div>
        ) : null}
      </SettingsDialogLayout>

      {profileEmployee ? (
        <EmployeeProfileDialog
          employee={profileEmployee}
          open={profileEmployee !== null}
          initialSection={profileSection}
          canTransfer={canTransferEmployees}
          onOpenChange={(open) => {
            if (!open) setProfileEmployee(null);
          }}
        />
      ) : null}
    </>
  );
}
