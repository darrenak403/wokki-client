"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CopyIcon, PlusIcon } from "lucide-react";
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
import { DepartmentSelect } from "@/components/shared/department-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EmployeeRowActions, employeeRoleLabel } from "./EmployeeRowActions";
import {
  useCreateEmployeeMutation,
  useEmployeesQuery,
  useTerminateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "@/hooks/useEmployees";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";
import type { CreateEmployeeResponse, EmployeeResponse } from "@/types/foundation";

const employeeCreateSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  firstName: z.string().min(1, "Vui lòng nhập họ"),
  lastName: z.string().min(1, "Vui lòng nhập tên"),
  departmentId: z.string().min(1, "Vui lòng chọn phòng ban"),
  role: z.enum([ROLE_USER, ROLE_MANAGER]),
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
      "Xếp lịch và duyệt ca trong chi nhánh được giao. Sau khi tạo, Admin gán chi nhánh trong mục Tổ chức.",
  },
] as const;

type EmployeesPanelProps = {
  canWrite?: boolean;
  canTransfer?: boolean;
};

export function EmployeesPanel({ canWrite = false, canTransfer = false }: EmployeesPanelProps) {
  const { session } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const filterDepartmentId = session.selectedDepartmentId;

  const [page, setPage] = useState(1);
  const [includeTerminated, setIncludeTerminated] = useState(false);
  const listParams = useMemo(
    () => ({
      page,
      pageSize: 20,
      ...(filterDepartmentId ? { departmentId: filterDepartmentId } : {}),
      ...(locationId && !filterDepartmentId ? { locationId } : {}),
      ...(includeTerminated ? { includeTerminated: true } : {}),
    }),
    [page, filterDepartmentId, locationId, includeTerminated]
  );

  const { data, isLoading, isError } = useEmployeesQuery(listParams);
  const createMutation = useCreateEmployeeMutation();
  const updateMutation = useUpdateEmployeeMutation();
  const terminateMutation = useTerminateEmployeeMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeResponse | null>(null);
  const [tempPassword, setTempPassword] = useState<CreateEmployeeResponse | null>(null);
  const [terminateTarget, setTerminateTarget] = useState<EmployeeResponse | null>(null);

  const createForm = useForm<z.infer<typeof employeeCreateSchema>>({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      departmentId: filterDepartmentId ?? "",
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
      role: ROLE_USER,
    });
    setOpen(true);
  };

  const openEdit = (row: EmployeeResponse) => {
    setEditing(row);
    updateForm.reset({
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      hourlyRate: row.hourlyRate,
      departmentId: row.departmentId,
    });
    setOpen(true);
  };

  const onCreate = createForm.handleSubmit(async (values: z.infer<typeof employeeCreateSchema>) => {
    const result = await createMutation.mutateAsync({
      ...values,
      hourlyRate: 0,
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-terminated"
              checked={includeTerminated}
              onCheckedChange={(checked) => {
                setIncludeTerminated(Boolean(checked));
                setPage(1);
              }}
            />
            <Label htmlFor="include-terminated" className="text-sm font-normal cursor-pointer">
              Hiện đã chấm dứt
            </Label>
          </div>
        </div>
        {canWrite ? (
          <Button type="button" onClick={openCreate} disabled={!locationId}>
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            Thêm nhân viên
          </Button>
        ) : null}
      </div>

      {isError ? (
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
                  <TableHead>Trạng thái</TableHead>
                  {showActions ? (
                    <TableHead className="w-[72px] text-right">Thao tác</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={showActions ? 6 : 5} className="h-24 text-center text-muted-foreground">
                      Đang tải…
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={showActions ? 6 : 5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không có nhân viên.
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa nhân viên" : "Thêm nhân viên"}</DialogTitle>
            {!editing ? (
              <DialogDescription>
                Một bước tạo cả tài khoản đăng nhập và hồ sơ nhân viên trong tổ chức. Sau khi tạo,
                gửi mật khẩu tạm cho người đó — họ đăng nhập và vào app ngay, không cần tự đăng
                ký.
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

                <Field>
                  <FieldLabel>Phòng ban</FieldLabel>
                  <DepartmentSelect
                    locationId={locationId}
                    value={createDepartmentId || null}
                    onChange={(id) => createForm.setValue("departmentId", id ?? "", { shouldValidate: true })}
                    allowEmpty={false}
                  />
                  <FieldError errors={[createForm.formState.errors.departmentId]} />
                </Field>

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

      <Dialog open={Boolean(tempPassword)} onOpenChange={() => setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tài khoản đã sẵn sàng</DialogTitle>
            <DialogDescription>
              Gửi thông tin bên dưới cho nhân viên. Họ đăng nhập một lần bằng mật khẩu tạm, sau đó
              vào đúng khu vực theo quyền đã chọn (Nhân viên → dashboard nhân viên; Quản lý → quản
              lý chi nhánh như Admin).
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
