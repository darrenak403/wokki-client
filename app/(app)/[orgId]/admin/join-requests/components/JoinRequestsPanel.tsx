"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useApproveOrgJoinMutation,
  usePendingOrgJoinRequestsQuery,
  useRejectOrgJoinMutation,
} from "@/hooks/useOrgJoin";
import { DepartmentSelect } from "@/components/shared/department-select";
import { LocationSelect } from "@/components/shared/location-select";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PendingOrgJoinRequestResponse } from "@/types/org-join";

const approveSchema = z.object({
  locationId: z.string().min(1, "Vui lòng chọn chi nhánh"),
  departmentId: z.string().min(1, "Vui lòng chọn phòng ban"),
  hourlyRate: z.number().min(0, "Lương giờ phải ≥ 0"),
  phone: z.string().optional(),
});

type ApproveFormValues = z.infer<typeof approveSchema>;

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function JoinRequestsPanel() {
  const { data, isLoading, refetch } = usePendingOrgJoinRequestsQuery();
  const approveMutation = useApproveOrgJoinMutation();
  const rejectMutation = useRejectOrgJoinMutation();

  const rows: PendingOrgJoinRequestResponse[] = data?.success ? (data.data ?? []) : [];

  const [approveTarget, setApproveTarget] = useState<PendingOrgJoinRequestResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingOrgJoinRequestResponse | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const approveForm = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      locationId: "",
      departmentId: "",
      hourlyRate: 0,
      phone: "",
    },
  });

  const locationId = approveForm.watch("locationId");

  const openApprove = (row: PendingOrgJoinRequestResponse) => {
    setApproveTarget(row);
    approveForm.reset({
      locationId: "",
      departmentId: "",
      hourlyRate: 0,
      phone: row.phone ?? "",
    });
  };

  const onApprove = approveForm.handleSubmit(async (values) => {
    if (!approveTarget) return;
    const result = await approveMutation.mutateAsync({
      id: approveTarget.id,
      data: {
        departmentId: values.departmentId,
        hourlyRate: values.hourlyRate,
        phone: values.phone?.trim() || null,
      },
    });
    if (result.success) {
      setApproveTarget(null);
    }
  });

  const onReject = async () => {
    if (!rejectTarget) return;
    const result = await rejectMutation.mutateAsync({
      id: rejectTarget.id,
      data: { note: rejectNote.trim() || null },
    });
    if (result.success) {
      setRejectTarget(null);
      setRejectNote("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Yêu cầu tham gia</h1>
          <p className="text-sm text-muted-foreground">
            Nhân viên tự đăng ký — duyệt và gán chi nhánh, phòng ban trước khi họ vào app.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Làm mới
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có yêu cầu đang chờ duyệt.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Gửi lúc</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    {row.firstName} {row.lastName}
                    {row.phone ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{row.phone}</span>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatDate(row.submittedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" size="sm" onClick={() => openApprove(row)}>
                        Duyệt
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectTarget(row);
                          setRejectNote("");
                        }}
                      >
                        Từ chối
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={approveTarget !== null} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu tham gia</DialogTitle>
            <DialogDescription>
              {approveTarget
                ? `${approveTarget.firstName} ${approveTarget.lastName} (${approveTarget.email})`
                : null}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onApprove} className="flex flex-col gap-4" noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel>Chi nhánh</FieldLabel>
                <LocationSelect
                  value={locationId || null}
                  onChange={(id) => {
                    approveForm.setValue("locationId", id ?? "", { shouldValidate: true });
                    approveForm.setValue("departmentId", "", { shouldValidate: true });
                  }}
                  required
                />
                <FieldError errors={[approveForm.formState.errors.locationId]} />
              </Field>
              <Field>
                <FieldLabel>Phòng ban</FieldLabel>
                <DepartmentSelect
                  locationId={locationId || null}
                  value={approveForm.watch("departmentId") || null}
                  onChange={(id) =>
                    approveForm.setValue("departmentId", id ?? "", { shouldValidate: true })
                  }
                  allowEmpty={false}
                />
                <FieldError errors={[approveForm.formState.errors.departmentId]} />
              </Field>
              <Field>
                <FieldLabel>Lương giờ (VND)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  {...approveForm.register("hourlyRate", { valueAsNumber: true })}
                />
                <FieldError errors={[approveForm.formState.errors.hourlyRate]} />
              </Field>
              <Field>
                <FieldLabel>Điện thoại (tùy chọn)</FieldLabel>
                <Input {...approveForm.register("phone")} />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setApproveTarget(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={approveMutation.isPending}>
                Xác nhận duyệt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectTarget !== null} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu?</DialogTitle>
            <DialogDescription>
              {rejectTarget
                ? `${rejectTarget.firstName} ${rejectTarget.lastName} (${rejectTarget.email})`
                : null}
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel>Lý do (tùy chọn)</FieldLabel>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value.slice(0, 500))}
              placeholder="Ghi chú gửi cho ứng viên…"
              rows={3}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRejectTarget(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={rejectMutation.isPending}
              onClick={() => void onReject()}
            >
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
