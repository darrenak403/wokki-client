"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2Icon,
  MapPinIcon,
  SlidersHorizontalIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react";
import {
  EmployeeProfileDialog,
  type EmployeeProfileSection,
} from "@/app/(app)/[orgId]/admin/workspace/components/EmployeeProfileDialog";
import { LocationManagersSection } from "@/app/(app)/[orgId]/admin/workspace/components/LocationManagersSection";
import { LocationPolicyDialog } from "@/app/(app)/[orgId]/admin/workspace/components/policy/LocationPolicyDialog";
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
  useCreateLocationMutation,
  useUpdateLocationMutation,
} from "@/hooks/useLocations";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { writeFoundationSession } from "@/lib/support/foundation/session-context";
import type { EmployeeResponse, LocationResponse } from "@/types/foundation";

const locationSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  timeZone: z.string().min(1, "Vui lòng nhập múi giờ"),
  isActive: z.boolean(),
});

type LocationFormValues = z.infer<typeof locationSchema>;
type LocationSection = "general" | "scheduling" | "managers" | "employees";

type LocationDetailDrawerProps = {
  location: LocationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite?: boolean;
  canEdit?: boolean;
  canAssignManagers?: boolean;
  canTransferEmployees?: boolean;
  isCreate?: boolean;
  onSaved?: () => void;
};

const PANEL_PADDING = "px-6 py-5";

export function LocationDetailDrawer({
  location,
  open,
  onOpenChange,
  canWrite = false,
  canEdit = false,
  canAssignManagers = false,
  canTransferEmployees = false,
  isCreate = false,
  onSaved,
}: LocationDetailDrawerProps) {
  const createMutation = useCreateLocationMutation();
  const updateMutation = useUpdateLocationMutation();
  const [activeSection, setActiveSection] = useState<LocationSection>("general");
  const [policyOpen, setPolicyOpen] = useState(false);
  const [profileEmployee, setProfileEmployee] = useState<EmployeeResponse | null>(null);
  const [profileSection, setProfileSection] = useState<EmployeeProfileSection>("profile");

  const { data: employeesPage } = useEmployeesQuery(
    {
      locationId: location?.id ?? "",
      page: 1,
      pageSize: 1,
      includeTerminated: false,
    },
    { enabled: open && Boolean(location?.id) && !isCreate }
  );
  const employeeCount = employeesPage?.totalCount ?? 0;

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: "",
      timeZone: "Asia/Ho_Chi_Minh",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    setActiveSection("general");
    if (isCreate || !location) {
      form.reset({
        name: "",
        address: "",
        timeZone: "Asia/Ho_Chi_Minh",
        isActive: true,
      });
      return;
    }
    form.reset({
      name: location.name,
      address: location.address,
      timeZone: location.timeZone,
      isActive: location.isActive,
    });
    writeFoundationSession({
      selectedLocationId: location.id,
      selectedDepartmentId: null,
    });
  }, [open, location, isCreate, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (isCreate || !location) {
      await createMutation.mutateAsync({
        name: values.name,
        address: values.address,
        timeZone: values.timeZone,
      });
    } else if (canWrite) {
      await updateMutation.mutateAsync({ id: location.id, data: values });
    } else {
      await updateMutation.mutateAsync({
        id: location.id,
        data: {
          name: values.name,
          address: location.address,
          timeZone: location.timeZone,
          isActive: location.isActive,
        },
      });
    }
    onSaved?.();
    onOpenChange(false);
  });

  const pending = createMutation.isPending || updateMutation.isPending;
  const canSave = isCreate ? canWrite : canWrite || canEdit;
  const nameReadOnly = !canWrite && !canEdit;
  const detailsReadOnly = !canWrite;

  const navItems = useMemo((): SettingsDialogNavItem<LocationSection>[] => {
    const items: SettingsDialogNavItem<LocationSection>[] = [
      { id: "general", label: "Thông tin chung", icon: MapPinIcon },
    ];
    if (canWrite && location) {
      items.push({ id: "scheduling", label: "Luật xếp lịch", icon: SlidersHorizontalIcon });
    }
    if (location) {
      items.push({ id: "managers", label: "Manager", icon: UserCogIcon });
      items.push({
        id: "employees",
        label: "Nhân viên",
        icon: UsersIcon,
        badge: employeeCount > 0 ? employeeCount : undefined,
      });
    }
    return items;
  }, [canWrite, location, employeeCount]);

  const saveFooter = canSave ? (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
        Hủy
      </Button>
      <Button type="submit" form="location-settings-form" disabled={pending}>
        {pending ? "Đang lưu…" : "Lưu"}
      </Button>
    </div>
  ) : null;

  if (isCreate) {
    return (
      <SimpleFormDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Thêm chi nhánh"
        description="Tạo chi nhánh mới trong tổ chức."
        footer={
          canWrite ? (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" form="location-create-form" disabled={pending}>
                {pending ? "Đang tạo…" : "Tạo chi nhánh"}
              </Button>
            </div>
          ) : null
        }
      >
        <form id="location-create-form" onSubmit={onSubmit} className="space-y-4" noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ws-loc-create-name">Tên</FieldLabel>
              <Input id="ws-loc-create-name" {...form.register("name")} />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="ws-loc-create-address">Địa chỉ</FieldLabel>
              <Input id="ws-loc-create-address" {...form.register("address")} />
              <FieldError errors={[form.formState.errors.address]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="ws-loc-create-tz">Múi giờ</FieldLabel>
              <Input id="ws-loc-create-tz" {...form.register("timeZone")} />
              <FieldError errors={[form.formState.errors.timeZone]} />
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
        title={location?.name ?? "Chi nhánh"}
        description="Cài đặt chi nhánh, luật xếp lịch và nhân sự."
        initialSection="general"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        navItems={navItems}
        headerMeta={
          location ? (
            <div className="rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-start gap-2">
                <Building2Icon className="mt-0.5 size-4 shrink-0 text-[#4C88C6]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                    {location.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{location.address}</p>
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
                {canWrite
                  ? "Chỉnh sửa thông tin chi nhánh và trạng thái hoạt động."
                  : canEdit
                    ? "Chỉnh sửa tên chi nhánh trong phạm vi quản lý."
                    : "Xem thông tin chi nhánh."}
              </p>
            </div>
            <form id="location-settings-form" onSubmit={onSubmit} className="space-y-4" noValidate>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="ws-loc-name">Tên</FieldLabel>
                  <Input id="ws-loc-name" readOnly={nameReadOnly} {...form.register("name")} />
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ws-loc-address">Địa chỉ</FieldLabel>
                  <Input
                    id="ws-loc-address"
                    readOnly={detailsReadOnly}
                    {...form.register("address")}
                  />
                  <FieldError errors={[form.formState.errors.address]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ws-loc-tz">Múi giờ</FieldLabel>
                  <Input id="ws-loc-tz" readOnly={detailsReadOnly} {...form.register("timeZone")} />
                  <FieldError errors={[form.formState.errors.timeZone]} />
                </Field>
                {location ? (
                  <Field className="flex flex-row items-center justify-between gap-4">
                    <FieldLabel htmlFor="ws-loc-active">Đang hoạt động</FieldLabel>
                    <Switch
                      id="ws-loc-active"
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

        {activeSection === "scheduling" && location && canWrite ? (
          <div className={PANEL_PADDING}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Luật xếp lịch</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cấu hình luật solver gợi ý lịch cho chi nhánh {location.name}.
              </p>
            </div>
            <div className="rounded-xl border border-dashed bg-muted/30 p-6">
              <p className="text-sm text-muted-foreground">
                Luật chi nhánh mở trong trình chỉnh riêng — gồm tìm kiếm, nhóm luật và lưu theo từng
                mục bắt buộc.
              </p>
              <Button type="button" className="mt-4" onClick={() => setPolicyOpen(true)}>
                <SlidersHorizontalIcon data-icon="inline-start" aria-hidden="true" />
                Mở trình chỉnh luật
              </Button>
            </div>
          </div>
        ) : null}

        {activeSection === "managers" && location ? (
          <div className={PANEL_PADDING}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Manager chi nhánh</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Chỉ Admin gán hoặc gỡ Manager. Manager chỉ thấy dữ liệu các chi nhánh được gán.
              </p>
            </div>
            <LocationManagersSection
              canAssignManagers={canAssignManagers}
              locationId={location.id}
              locationName={location.name}
            />
          </div>
        ) : null}

        {activeSection === "employees" && location ? (
          <div className={PANEL_PADDING}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Nhân viên</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Danh sách nhân viên đang làm việc tại chi nhánh {location.name}.
              </p>
            </div>
            <WorkspaceEmployeesPanel
              locationId={location.id}
              showDepartmentColumn
              enabled={activeSection === "employees"}
              onEmployeeClick={(emp) => {
                setProfileSection("profile");
                setProfileEmployee(emp);
              }}
            />
          </div>
        ) : null}
      </SettingsDialogLayout>

      {location ? (
        <LocationPolicyDialog
          key={location.id}
          location={location}
          open={policyOpen}
          onOpenChange={setPolicyOpen}
          canWrite={canWrite}
        />
      ) : null}
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
