"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CopyIcon, PencilIcon, PlusIcon, UserXIcon } from "lucide-react";
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
import { DepartmentSelect } from "@/components/shared/department-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EmployeeTransferAction } from "@/app/(app)/[orgId]/admin/workspace/components/EmployeeTransferAction";
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
  phone: z.string().optional(),
  position: z.string().min(1, "Vui lòng nhập chức danh"),
  hourlyRate: z.number().min(0, "Lương giờ phải ≥ 0"),
  departmentId: z.string().min(1, "Vui lòng chọn phòng ban"),
  role: z.enum([ROLE_USER, ROLE_MANAGER]),
});

const employeeUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string(),
  position: z.string().min(1),
  hourlyRate: z.number().min(0),
  departmentId: z.string().min(1),
});

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
      phone: "",
      position: "",
      hourlyRate: 0,
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
      phone: "",
      position: "",
      hourlyRate: 25000,
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
      position: row.position,
      hourlyRate: row.hourlyRate,
      departmentId: row.departmentId,
    });
    setOpen(true);
  };

  const onCreate = createForm.handleSubmit(async (values: z.infer<typeof employeeCreateSchema>) => {
    const result = await createMutation.mutateAsync({
      ...values,
      phone: values.phone || undefined,
    });
    setOpen(false);
    setTempPassword(result);
    toast.success("Đã tạo nhân viên.");
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                {showActions ? <TableHead className="w-[260px]" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 6 : 5}>Đang tải…</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 6 : 5} className="text-muted-foreground">
                    Không có nhân viên.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.lastName} {row.firstName}
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.departmentName}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>
                      {row.terminatedAt ? (
                        <Badge variant="outline">Đã chấm dứt</Badge>
                      ) : (
                        <Badge variant="secondary">Đang làm</Badge>
                      )}
                    </TableCell>
                    {showActions ? (
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-1">
                          {canTransfer ? <EmployeeTransferAction employee={row} /> : null}
                          {canWrite ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(row)}
                              disabled={Boolean(row.terminatedAt)}
                            >
                              <PencilIcon data-icon="inline-start" aria-hidden="true" />
                              Sửa
                            </Button>
                          ) : null}
                          {canWrite && !row.terminatedAt ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setTerminateTarget(row)}
                            >
                              <UserXIcon data-icon="inline-start" aria-hidden="true" />
                              Chấm dứt
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    ) : null}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa nhân viên" : "Thêm nhân viên"}</DialogTitle>
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
                  <FieldLabel>Chức danh</FieldLabel>
                  <Input {...updateForm.register("position")} />
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
            <form onSubmit={onCreate} className="flex flex-col gap-4" noValidate>
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input type="email" {...createForm.register("email")} />
                  <FieldError errors={[createForm.formState.errors.email]} />
                </Field>
                <Field>
                  <FieldLabel>Họ</FieldLabel>
                  <Input {...createForm.register("firstName")} />
                </Field>
                <Field>
                  <FieldLabel>Tên</FieldLabel>
                  <Input {...createForm.register("lastName")} />
                </Field>
                <Field>
                  <FieldLabel>Chức danh</FieldLabel>
                  <Input {...createForm.register("position")} />
                </Field>
                <Field>
                  <FieldLabel>Lương giờ</FieldLabel>
                  <Input
                    type="number"
                    {...createForm.register("hourlyRate", { valueAsNumber: true })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Phòng ban</FieldLabel>
                  <DepartmentSelect
                    locationId={locationId}
                    value={createDepartmentId || null}
                    onChange={(id) => createForm.setValue("departmentId", id ?? "")}
                    allowEmpty={false}
                  />
                </Field>
                <Field>
                  <FieldLabel>Vai trò</FieldLabel>
                  <Controller
                    control={createForm.control}
                    name="role"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          if (v !== null) field.onChange(v);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ROLE_USER}>Người đi làm (User)</SelectItem>
                          <SelectItem value={ROLE_MANAGER}>Trưởng ca (Manager)</SelectItem>
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
                  Tạo nhân viên
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(tempPassword)} onOpenChange={() => setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mật khẩu tạm</DialogTitle>
            <DialogDescription>
              Chỉ hiển thị một lần. Sao chép và gửi cho nhân viên — họ đăng nhập và vào app
              trực tiếp (không tự đăng ký).
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
