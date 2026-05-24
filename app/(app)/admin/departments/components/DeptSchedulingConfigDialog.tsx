"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateJobPositionMutation,
  useDeleteJobPositionMutation,
  useJobPositionsQuery,
  useSchedulingPolicyQuery,
  useUpdateJobPositionMutation,
  useUpdateSchedulingPolicyMutation,
} from "@/hooks/useSchedulingConfig";
import type { DepartmentResponse } from "@/types/foundation";
import type { JobPositionResponse } from "@/types/scheduling-config";

const policySchema = z.object({
  maxShiftsPerEmployeePerWeek: z.number().int().min(1, "Tối thiểu 1").max(168, "Tối đa 168"),
});

const jobSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  code: z.string().min(1, "Vui lòng nhập mã"),
  targetHeadcount: z.number().int().min(1, "≥ 1"),
});

type PolicyFormValues = z.infer<typeof policySchema>;
type JobFormValues = z.infer<typeof jobSchema>;

type DeptSchedulingConfigDialogProps = {
  department: DepartmentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite?: boolean;
};

export function DeptSchedulingConfigDialog({
  department,
  open,
  onOpenChange,
  canWrite = true,
}: DeptSchedulingConfigDialogProps) {
  const departmentId = department?.id ?? null;
  const { data: policy, isLoading: policyLoading } = useSchedulingPolicyQuery(
    open ? departmentId : null,
  );
  const { data: positions = [], isLoading: positionsLoading } = useJobPositionsQuery(
    open ? departmentId : null,
  );
  const updatePolicy = useUpdateSchedulingPolicyMutation(departmentId ?? "");
  const createPosition = useCreateJobPositionMutation(departmentId ?? "");
  const updatePosition = useUpdateJobPositionMutation(departmentId ?? "");
  const deletePosition = useDeleteJobPositionMutation(departmentId ?? "");

  const policyForm = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: { maxShiftsPerEmployeePerWeek: 20 },
  });

  const [jobOpen, setJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPositionResponse | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const jobForm = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: { name: "", code: "", targetHeadcount: 1 },
  });

  useEffect(() => {
    if (policy) {
      policyForm.reset({ maxShiftsPerEmployeePerWeek: policy.maxShiftsPerEmployeePerWeek });
    }
  }, [policy, policyForm]);

  const onPolicySubmit = policyForm.handleSubmit(async (values) => {
    if (!departmentId || !canWrite) return;
    await updatePolicy.mutateAsync(values);
  });

  const openCreateJob = () => {
    setEditingJob(null);
    jobForm.reset({ name: "", code: "", targetHeadcount: 1 });
    setJobOpen(true);
  };

  const openEditJob = (row: JobPositionResponse) => {
    setEditingJob(row);
    jobForm.reset({
      name: row.name,
      code: row.code,
      targetHeadcount: row.targetHeadcount,
    });
    setJobOpen(true);
  };

  const onJobSubmit = jobForm.handleSubmit(async (values) => {
    if (!departmentId || !canWrite) return;
    if (editingJob) {
      await updatePosition.mutateAsync({
        jobPositionId: editingJob.id,
        data: { ...values, isActive: editingJob.isActive },
      });
    } else {
      await createPosition.mutateAsync(values);
    }
    setJobOpen(false);
  });

  const pending =
    updatePolicy.isPending ||
    createPosition.isPending ||
    updatePosition.isPending ||
    deletePosition.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cấu hình lịch — {department?.name ?? ""}</DialogTitle>
            <DialogDescription>
              Phòng ban kế thừa luật chi nhánh; cấu hình ở đây chỉ là override riêng và vị trí mục tiêu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <section className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Override luật phòng ban</h3>
                <p className="text-xs text-muted-foreground">
                  Nếu không đổi, solver dùng rule catalog của chi nhánh làm điều kiện nền.
                </p>
              </div>
              {policyLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải…</p>
              ) : (
                <form onSubmit={onPolicySubmit} className="flex flex-wrap items-end gap-3">
                  <Field className="max-w-xs">
                    <FieldLabel htmlFor="max-shifts-week">Số ca tối đa / NV / tuần</FieldLabel>
                    <Input
                      id="max-shifts-week"
                      type="number"
                      min={1}
                      max={168}
                      disabled={!canWrite}
                      {...policyForm.register("maxShiftsPerEmployeePerWeek")}
                    />
                    <FieldError
                      errors={[policyForm.formState.errors.maxShiftsPerEmployeePerWeek]}
                    />
                  </Field>
                  {canWrite ? (
                    <Button type="submit" disabled={updatePolicy.isPending}>
                      {updatePolicy.isPending ? "Đang lưu…" : "Lưu luật"}
                    </Button>
                  ) : null}
                </form>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Vị trí (job positions)</h3>
                {canWrite ? (
                  <Button type="button" size="sm" variant="outline" onClick={openCreateJob}>
                    <PlusIcon className="size-4" />
                    Thêm vị trí
                  </Button>
                ) : null}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Mã</TableHead>
                    <TableHead>Headcount</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    {canWrite ? <TableHead className="w-[120px]" /> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={canWrite ? 5 : 4} className="text-muted-foreground">
                        Đang tải…
                      </TableCell>
                    </TableRow>
                  ) : positions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canWrite ? 5 : 4} className="text-muted-foreground">
                        Chưa có vị trí.
                      </TableCell>
                    </TableRow>
                  ) : (
                    positions.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{row.code}</TableCell>
                        <TableCell>{row.targetHeadcount}</TableCell>
                        <TableCell>
                          {row.isActive ? (
                            <Badge variant="secondary">Active</Badge>
                          ) : (
                            <Badge variant="outline">Ngưng</Badge>
                          )}
                        </TableCell>
                        {canWrite ? (
                          <TableCell className="space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditJob(row)}
                            >
                              <PencilIcon className="size-4" />
                            </Button>
                            {row.isActive ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteJobId(row.id)}
                              >
                                <Trash2Icon className="size-4" />
                              </Button>
                            ) : null}
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </section>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={jobOpen} onOpenChange={setJobOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingJob ? "Sửa vị trí" : "Thêm vị trí"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onJobSubmit} className="space-y-4" noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="jp-name">Tên</FieldLabel>
                <Input id="jp-name" {...jobForm.register("name")} />
                <FieldError errors={[jobForm.formState.errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="jp-code">Mã</FieldLabel>
                <Input id="jp-code" {...jobForm.register("code")} />
                <FieldError errors={[jobForm.formState.errors.code]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="jp-headcount">Headcount mục tiêu</FieldLabel>
                <Input
                  id="jp-headcount"
                  type="number"
                  min={1}
                  {...jobForm.register("targetHeadcount")}
                />
                <FieldError errors={[jobForm.formState.errors.targetHeadcount]} />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setJobOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Đang lưu…" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteJobId)} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vô hiệu hóa vị trí?</AlertDialogTitle>
            <AlertDialogDescription>
              Vị trí sẽ không dùng cho báo cáo headcount mới.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteJobId) await deletePosition.mutateAsync(deleteJobId);
                setDeleteJobId(null);
              }}
            >
              Vô hiệu hóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
