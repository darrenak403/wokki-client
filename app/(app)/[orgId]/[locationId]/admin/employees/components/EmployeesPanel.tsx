"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CopyIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DepartmentScopeChips } from "@/components/shared/department-scope-chips";
import { DepartmentSelect } from "@/components/shared/department-select";
import {
  EMPLOYEE_CREATE_PAIR_HEIGHT_CLASS,
  EMPLOYEE_PANEL_WIDTH_CLASS,
} from "@/components/shared/employee-create-dialog-pair-layout";
import { EmployeeCreatePairShell } from "@/components/shared/employee-create-pair-shell";
import { EmployeeDepartmentWorkspacePanel } from "@/components/shared/employee-department-workspace-panel";
import { EmployeeManagerLocationPanel } from "@/components/shared/employee-manager-location-panel";
import { cn } from "@/lib/utils";
import { EmployeeRowActions, employeeRoleLabel } from "./EmployeeRowActions";
import { EmployeePaymentProfileTrigger } from "@/components/shared/employee-payment-profile-trigger";
import {
  useCreateEmployeeMutation,
  useEmployeesQuery,
  useTerminateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "@/hooks/useEmployees";
import { useDepartmentsQuery } from "@/hooks/useDepartments";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { useLocationsQuery } from "@/hooks/useLocations";
import { useIsMobile } from "@/hooks/useMobile";
import { ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";
import type { CreateEmployeeResponse, EmployeeResponse } from "@/types/foundation";

const employeeCreateSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    firstName: z.string().min(1, "Vui lòng nhập họ"),
    lastName: z.string().min(1, "Vui lòng nhập tên"),
    departmentId: z.string().optional(),
    locationIds: z.array(z.string()).optional(),
    role: z.enum([ROLE_USER, ROLE_MANAGER]),
  })
  .superRefine((data, ctx) => {
    if (data.role === ROLE_USER && !data.departmentId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng chọn phòng ban",
        path: ["departmentId"],
      });
    }
    if (data.role === ROLE_MANAGER && (data.locationIds?.length ?? 0) === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng chọn ít nhất một chi nhánh",
        path: ["locationIds"],
      });
    }
  });

const employeeUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string(),
  hourlyRate: z.number().min(0),
  departmentId: z.string().min(1),
});

const CREATE_ROLE_OPTIONS = [
  {
    value: ROLE_USER,
    title: "Nhân viên",
    description: "Xem lịch ca, đăng ký ca và chấm công của bản thân.",
  },
  {
    value: ROLE_MANAGER,
    title: "Quản lý chi nhánh",
    description:
      "Toàn quyền trên các chi nhánh Admin chỉ định lúc tạo. Khi đăng nhập chỉ thấy các chi nhánh được giao — không cần gán phòng ban.",
  },
] as const;

type EmployeesPanelProps = {
  canWrite?: boolean;
  canTransfer?: boolean;
};

export function EmployeesPanel({ canWrite = false, canTransfer = false }: EmployeesPanelProps) {
  const { session, setDepartmentId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const filterDepartmentId = session.selectedDepartmentId;
  const isMobile = useIsMobile();
  const { data: locations = [] } = useLocationsQuery();
  const currentLocation = useMemo(
    () => locations.find((location) => location.id === locationId),
    [locations, locationId]
  );

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const listParams = useMemo(
    () =>
      filterDepartmentId
        ? {
            page,
            pageSize: 20,
            departmentId: filterDepartmentId,
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
          }
        : { page, pageSize: 20 },
    [page, filterDepartmentId, debouncedSearch],
  );

  const { data, isLoading, isError } = useEmployeesQuery(listParams, {
    enabled: Boolean(filterDepartmentId),
  });
  const { data: departments = [] } = useDepartmentsQuery(locationId);
  const createMutation = useCreateEmployeeMutation();
  const updateMutation = useUpdateEmployeeMutation();
  const terminateMutation = useTerminateEmployeeMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeResponse | null>(null);
  const [tempPassword, setTempPassword] = useState<CreateEmployeeResponse | null>(null);
  const [terminateTarget, setTerminateTarget] = useState<EmployeeResponse | null>(null);

  useEffect(() => {
    if (!locationId || filterDepartmentId || departments.length === 0) return;
    const firstActive = departments.find((dept) => dept.isActive) ?? departments[0];
    if (firstActive) setDepartmentId(firstActive.id);
  }, [departments, filterDepartmentId, locationId, setDepartmentId]);

  useEffect(() => {
    setPage(1);
  }, [filterDepartmentId]);

  const createForm = useForm<z.infer<typeof employeeCreateSchema>>({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      departmentId: filterDepartmentId ?? "",
      locationIds: locationId ? [locationId] : [],
      role: ROLE_USER,
    },
  });

  const updateForm = useForm<z.infer<typeof employeeUpdateSchema>>({
    resolver: zodResolver(employeeUpdateSchema),
  });
  const createDepartmentId = useWatch({
    control: createForm.control,
    name: "departmentId",
  });
  const createRole = useWatch({
    control: createForm.control,
    name: "role",
  });
  const createLocationIds = useWatch({
    control: createForm.control,
    name: "locationIds",
  }) ?? [];
  const updateDepartmentId = useWatch({
    control: updateForm.control,
    name: "departmentId",
  });

  const openCreate = () => {
    setEditing(null);
    createForm.reset({
      email: "",
      firstName: "",
      lastName: "",
      departmentId: filterDepartmentId ?? "",
      locationIds: locationId ? [locationId] : [],
      role: ROLE_USER,
    });
    setOpen(true);
  };

  const toggleCreateLocation = (targetLocationId: string) => {
    const current = createForm.getValues("locationIds") ?? [];
    const next = current.includes(targetLocationId)
      ? current.filter((id) => id !== targetLocationId)
      : [...current, targetLocationId];
    createForm.setValue("locationIds", next, { shouldValidate: true });
  };

  const openEdit = (row: EmployeeResponse) => {
    setEditing(row);
    updateForm.reset({
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      hourlyRate: row.hourlyRate,
      departmentId: row.departmentId ?? "",
    });
    setOpen(true);
  };

  const onCreate = createForm.handleSubmit(async (values: z.infer<typeof employeeCreateSchema>) => {
    const result = await createMutation.mutateAsync({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      hourlyRate: 0,
      role: values.role,
      ...(values.role === ROLE_USER && values.departmentId
        ? { departmentId: values.departmentId }
        : {}),
      ...(values.role === ROLE_MANAGER && values.locationIds?.length
        ? { locationIds: values.locationIds }
        : {}),
    });
    setOpen(false);
    setTempPassword(result);
    toast.success("Đã tạo nhân viên và tài khoản đăng nhập.");
  });

  const onUpdate = updateForm.handleSubmit(async (values: z.infer<typeof employeeUpdateSchema>) => {
    if (!editing) return;
    await updateMutation.mutateAsync({ id: editing.id, data: values });
    setOpen(false);
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const showActions = canWrite || canTransfer;
  const usePairLayout =
    open && !editing && !isMobile && (createRole === ROLE_USER || createRole === ROLE_MANAGER);
  const showDepartmentWorkspaceMobile = open && !editing && isMobile && createRole === ROLE_USER;
  const showManagerLocationMobile = open && !editing && isMobile && createRole === ROLE_MANAGER;
  const selectedCreateDepartmentName = useMemo(
    () => departments.find((dept) => dept.id === createDepartmentId)?.name,
    [departments, createDepartmentId]
  );
  const selectedCreateLocationNames = useMemo(
    () =>
      locations
        .filter((loc) => createLocationIds.includes(loc.id))
        .map((loc) => loc.name),
    [locations, createLocationIds]
  );

  const handleEmployeeDialogOpenChange = (next: boolean) => {
    setOpen(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4 border-b pb-4">
        <DepartmentScopeChips
          locationId={locationId}
          value={filterDepartmentId}
          onChange={setDepartmentId}
          allowAll={false}
          maxVisible={5}
        />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-4">
            <div className="relative w-full min-w-[220px] max-w-sm">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm theo tên, email, SĐT…"
                className="h-9 bg-background pl-9 pr-9"
                aria-label="Tìm nhân viên"
              />
              {searchInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => setSearchInput("")}
                >
                  <XIcon className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>
          {canWrite ? (
            <Button
              type="button"
              onClick={openCreate}
              disabled={!locationId || !filterDepartmentId}
            >
              <PlusIcon data-icon="inline-start" aria-hidden="true" />
              Thêm nhân viên
            </Button>
          ) : null}
        </div>
      </div>

      {!locationId ? (
        <p className="text-sm text-muted-foreground">Chọn chi nhánh trước.</p>
      ) : departments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có phòng ban trong chi nhánh này.</p>
      ) : !filterDepartmentId ? (
        <p className="text-sm text-muted-foreground">Chọn phòng ban để xem nhân sự.</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Không tải được danh sách nhân viên.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>STK / QR</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  {showActions ? (
                    <TableHead className="w-[72px] text-right">Thao tác</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={showActions ? 7 : 6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Đang tải…
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={showActions ? 7 : 6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không có nhân viên
                      {debouncedSearch ? " phù hợp" : ""} trong phòng ban này.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.lastName} {row.firstName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.email}</TableCell>
                      <TableCell>{row.departmentName ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{employeeRoleLabel(row.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <EmployeePaymentProfileTrigger
                          employeeName={`${row.lastName} ${row.firstName}`}
                          profile={{
                            bankName: row.bankName,
                            bankAccountHolderName: row.bankAccountHolderName,
                            bankAccountNumber: row.bankAccountNumber,
                            paymentQrImageUrl: row.paymentQrImageUrl,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {row.terminatedAt ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            Đã chấm dứt
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Đang làm</Badge>
                        )}
                      </TableCell>
                      {showActions ? (
                        <TableCell className="text-right">
                          <EmployeeRowActions
                            employee={row}
                            canWrite={canWrite}
                            canTransfer={canTransfer}
                            onEdit={openEdit}
                            onTerminate={setTerminateTarget}
                          />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {data?.totalCount != null ? `${data.totalCount} nhân viên` : null}
            </p>
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
          </div>
        </>
      )}

      {usePairLayout ? (
        <EmployeeCreatePairShell open={open} onOpenChange={handleEmployeeDialogOpenChange}>
          <div
            role="dialog"
            aria-labelledby="create-employee-title"
            className={cn(
              EMPLOYEE_PANEL_WIDTH_CLASS,
              EMPLOYEE_CREATE_PAIR_HEIGHT_CLASS,
              "relative flex flex-col overflow-hidden rounded-2xl bg-popover p-4 text-popover-foreground shadow-xl ring-1 ring-foreground/10 sm:p-5"
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4"
              aria-label="Đóng"
              onClick={() => setOpen(false)}
            >
              <XIcon />
            </Button>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <header className="mb-4 shrink-0 pr-8">
                <h2 id="create-employee-title" className="text-base font-medium leading-none">
                  Thêm nhân viên
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Tạo tài khoản đăng nhập và hồ sơ nhân viên. Gửi mật khẩu tạm sau khi tạo.
                </p>
              </header>
              <form onSubmit={onCreate} className="flex min-h-0 flex-1 flex-col gap-5" noValidate>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel>Email đăng nhập</FieldLabel>
                      <Input
                        type="email"
                        autoComplete="off"
                        placeholder="nhanvien@congty.vn"
                        {...createForm.register("email")}
                      />
                      <FieldError errors={[createForm.formState.errors.email]} />
                    </Field>
                    <div className="flex flex-col gap-4">
                      <Field>
                        <FieldLabel>Họ</FieldLabel>
                        <Input {...createForm.register("firstName")} />
                        <FieldError errors={[createForm.formState.errors.firstName]} />
                      </Field>
                      <Field>
                        <FieldLabel>Tên</FieldLabel>
                        <Input {...createForm.register("lastName")} />
                        <FieldError errors={[createForm.formState.errors.lastName]} />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel>Quyền truy cập</FieldLabel>
                      <Controller
                        control={createForm.control}
                        name="role"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={(value) => {
                              if (value === ROLE_USER || value === ROLE_MANAGER) {
                                field.onChange(value);
                                if (value === ROLE_MANAGER) {
                                  createForm.setValue("departmentId", "", { shouldValidate: true });
                                  const currentLocations = createForm.getValues("locationIds");
                                  if (!currentLocations?.length && locationId) {
                                    createForm.setValue("locationIds", [locationId], {
                                      shouldValidate: true,
                                    });
                                  }
                                }
                                if (value === ROLE_USER) {
                                  createForm.setValue("locationIds", [], { shouldValidate: true });
                                }
                              }
                            }}
                            className="gap-2"
                          >
                            {CREATE_ROLE_OPTIONS.map((option) => (
                              <label
                                key={option.value}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                                  field.value === option.value
                                    ? "border-[#4C88C6] bg-[#EEF6FB]/80 dark:border-[#4C88C6]/50 dark:bg-[#0B1E3D]/40"
                                    : "border-border hover:bg-muted/40"
                                }`}
                              >
                                <RadioGroupItem value={option.value} className="mt-0.5" />
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-semibold">
                                    {option.title}
                                  </span>
                                  <span className="mt-0.5 block text-xs text-muted-foreground">
                                    {option.description}
                                  </span>
                                </span>
                              </label>
                            ))}
                          </RadioGroup>
                        )}
                      />
                    </Field>
                    {createForm.formState.errors.departmentId && createRole === ROLE_USER ? (
                      <FieldError errors={[createForm.formState.errors.departmentId]} />
                    ) : null}
                    {createForm.formState.errors.locationIds && createRole === ROLE_MANAGER ? (
                      <FieldError errors={[createForm.formState.errors.locationIds]} />
                    ) : null}
                  </FieldGroup>
                </div>
                <div className="flex shrink-0 flex-col gap-2 border-t bg-muted/50 pt-4 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    Tạo tài khoản
                  </Button>
                </div>
              </form>
            </div>
          </div>
          {createRole === ROLE_USER ? (
          <EmployeeDepartmentWorkspacePanel
            embedded
            open={open}
            locationId={locationId}
            locationName={currentLocation?.name ?? "Chi nhánh"}
            locationAddress={currentLocation?.address}
            selectedDepartmentId={createDepartmentId || null}
            onSelectDepartment={(departmentId) => {
              createForm.setValue("departmentId", departmentId, { shouldValidate: true });
            }}
            onCreated={(departmentId) => {
              createForm.setValue("departmentId", departmentId, { shouldValidate: true });
            }}
          />
          ) : (
          <EmployeeManagerLocationPanel
            embedded
            open={open}
            selectedLocationIds={createLocationIds}
            onToggleLocation={toggleCreateLocation}
            onLocationCreated={(locationId) => {
              const current = createForm.getValues("locationIds") ?? [];
              if (!current.includes(locationId)) {
                createForm.setValue("locationIds", [...current, locationId], {
                  shouldValidate: true,
                });
              }
            }}
          />
          )}
        </EmployeeCreatePairShell>
      ) : null}

      <Dialog open={open && !usePairLayout} onOpenChange={handleEmployeeDialogOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa nhân viên" : "Thêm nhân viên"}</DialogTitle>
            {!editing ? (
              <DialogDescription>
                Một bước tạo cả tài khoản đăng nhập và hồ sơ nhân viên trong tổ chức. Sau khi tạo,
                gửi mật khẩu tạm cho người đó — họ đăng nhập và vào app ngay, không cần tự đăng ký.
              </DialogDescription>
            ) : null}
          </DialogHeader>
          {editing ? (
            <form onSubmit={onUpdate} className="flex flex-col gap-4" noValidate>
              <FieldGroup>
                <Field>
                  <FieldLabel>Họ</FieldLabel>
                  <Input {...updateForm.register("firstName")} />
                  <FieldError errors={[updateForm.formState.errors.firstName]} />
                </Field>
                <Field>
                  <FieldLabel>Tên</FieldLabel>
                  <Input {...updateForm.register("lastName")} />
                </Field>
                <Field>
                  <FieldLabel>Điện thoại</FieldLabel>
                  <Input {...updateForm.register("phone")} />
                </Field>
                <Field>
                  <FieldLabel>Lương giờ</FieldLabel>
                  <Input
                    type="number"
                    {...updateForm.register("hourlyRate", { valueAsNumber: true })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Phòng ban</FieldLabel>
                  <DepartmentSelect
                    locationId={locationId}
                    value={updateDepartmentId ?? null}
                    onChange={(id) => updateForm.setValue("departmentId", id ?? "")}
                    allowEmpty={false}
                  />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  Lưu
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={onCreate} className="flex flex-col gap-5" noValidate>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel>Email đăng nhập</FieldLabel>
                  <Input
                    type="email"
                    autoComplete="off"
                    placeholder="nhanvien@congty.vn"
                    {...createForm.register("email")}
                  />
                  <FieldError errors={[createForm.formState.errors.email]} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Họ</FieldLabel>
                    <Input {...createForm.register("firstName")} />
                    <FieldError errors={[createForm.formState.errors.firstName]} />
                  </Field>
                  <Field>
                    <FieldLabel>Tên</FieldLabel>
                    <Input {...createForm.register("lastName")} />
                    <FieldError errors={[createForm.formState.errors.lastName]} />
                  </Field>
                </div>
                {createRole === ROLE_USER ? (
                <Field>
                  <FieldLabel>Phòng ban</FieldLabel>
                  <div
                    className={cn(
                      "flex min-h-10 items-center rounded-lg border px-3 text-sm",
                      selectedCreateDepartmentName
                        ? "border-input bg-background font-medium"
                        : "border-dashed border-muted-foreground/40 bg-muted/20 text-muted-foreground italic"
                    )}
                  >
                    {selectedCreateDepartmentName ?? "Chọn trên sơ đồ phía trên"}
                  </div>
                  <FieldError errors={[createForm.formState.errors.departmentId]} />
                </Field>
                ) : null}
                {createRole === ROLE_MANAGER ? (
                <Field>
                  <FieldLabel>Chi nhánh quản lý</FieldLabel>
                  <div
                    className={cn(
                      "flex min-h-10 flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      selectedCreateLocationNames.length > 0
                        ? "border-input bg-background"
                        : "border-dashed border-muted-foreground/40 bg-muted/20 text-muted-foreground italic"
                    )}
                  >
                    {selectedCreateLocationNames.length > 0 ? (
                      selectedCreateLocationNames.map((name) => (
                        <Badge key={name} variant="secondary">
                          {name}
                        </Badge>
                      ))
                    ) : (
                      "Chọn trên sơ đồ phía trên"
                    )}
                  </div>
                  <FieldError errors={[createForm.formState.errors.locationIds]} />
                </Field>
                ) : null}
                <Field>
                  <FieldLabel>Quyền truy cập</FieldLabel>
                  <Controller
                    control={createForm.control}
                    name="role"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          if (value === ROLE_USER || value === ROLE_MANAGER) {
                            field.onChange(value);
                            if (value === ROLE_MANAGER) {
                              createForm.setValue("departmentId", "", { shouldValidate: true });
                              const currentLocations = createForm.getValues("locationIds");
                              if (!currentLocations?.length && locationId) {
                                createForm.setValue("locationIds", [locationId], {
                                  shouldValidate: true,
                                });
                              }
                            }
                            if (value === ROLE_USER) {
                              createForm.setValue("locationIds", [], { shouldValidate: true });
                            }
                          }
                        }}
                        className="gap-2"
                      >
                        {CREATE_ROLE_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                              field.value === option.value
                                ? "border-[#4C88C6] bg-[#EEF6FB]/80 dark:border-[#4C88C6]/50 dark:bg-[#0B1E3D]/40"
                                : "border-border hover:bg-muted/40"
                            }`}
                          >
                            <RadioGroupItem value={option.value} className="mt-0.5" />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold">{option.title}</span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </span>
                          </label>
                        ))}
                      </RadioGroup>
                    )}
                  />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Tạo tài khoản
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {showDepartmentWorkspaceMobile ? (
        <EmployeeDepartmentWorkspacePanel
          open={showDepartmentWorkspaceMobile}
          locationId={locationId}
          locationName={currentLocation?.name ?? "Chi nhánh"}
          locationAddress={currentLocation?.address}
          selectedDepartmentId={createDepartmentId || null}
          onSelectDepartment={(departmentId) => {
            createForm.setValue("departmentId", departmentId, { shouldValidate: true });
          }}
          onCreated={(departmentId) => {
            createForm.setValue("departmentId", departmentId, { shouldValidate: true });
          }}
        />
      ) : null}

      {showManagerLocationMobile ? (
        <EmployeeManagerLocationPanel
          open={showManagerLocationMobile}
          selectedLocationIds={createLocationIds}
          onToggleLocation={toggleCreateLocation}
          onLocationCreated={(locationId) => {
            const current = createForm.getValues("locationIds") ?? [];
            if (!current.includes(locationId)) {
              createForm.setValue("locationIds", [...current, locationId], {
                shouldValidate: true,
              });
            }
          }}
        />
      ) : null}

      <Dialog open={Boolean(tempPassword)} onOpenChange={() => setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tài khoản đã sẵn sàng</DialogTitle>
            <DialogDescription>
              Gửi thông tin bên dưới cho nhân viên. Họ đăng nhập một lần bằng mật khẩu tạm, sau đó
              vào đúng khu vực theo quyền đã chọn (Nhân viên → chi nhánh/phòng ban đã gán; Quản lý →
              các chi nhánh được Admin chỉ định).
            </DialogDescription>
          </DialogHeader>
          {tempPassword ? (
            <div className="flex flex-col gap-2 rounded-md bg-muted p-3 font-mono text-sm">
              <p>{tempPassword.email}</p>
              <p className="font-semibold">{tempPassword.temporaryPassword}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                if (tempPassword) {
                  void navigator.clipboard.writeText(tempPassword.temporaryPassword);
                  toast.success("Đã sao chép mật khẩu.");
                }
              }}
            >
              <CopyIcon data-icon="inline-start" aria-hidden="true" />
              Sao chép
            </Button>
            <Button type="button" onClick={() => setTempPassword(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(terminateTarget)} onOpenChange={() => setTerminateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chấm dứt hợp đồng?</AlertDialogTitle>
            <AlertDialogDescription>
              Nhân viên sẽ không được phân ca mới. Thao tác này không xóa lịch sử.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (terminateTarget) {
                  await terminateMutation.mutateAsync(terminateTarget.id);
                }
                setTerminateTarget(null);
              }}
            >
              Chấm dứt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
