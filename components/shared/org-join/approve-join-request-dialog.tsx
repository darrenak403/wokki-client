"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApproveOrgJoinMutation } from "@/hooks/useOrgJoin";
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
import type { PendingOrgJoinRequestResponse } from "@/types/org-join";

const approveSchema = z.object({
  locationId: z.string().min(1, "Vui lòng chọn chi nhánh"),
  departmentId: z.string().min(1, "Vui lòng chọn phòng ban"),
  hourlyRate: z.number().min(0, "Lương giờ phải ≥ 0"),
  phone: z.string().optional(),
});

type ApproveFormValues = z.infer<typeof approveSchema>;

type ApproveJoinRequestDialogProps = {
  target: PendingOrgJoinRequestResponse | null;
  onClose: () => void;
};

export function ApproveJoinRequestDialog({ target, onClose }: ApproveJoinRequestDialogProps) {
  const approveMutation = useApproveOrgJoinMutation();
  const approveForm = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: { locationId: "", departmentId: "", hourlyRate: 0, phone: "" },
  });
  const locationId = approveForm.watch("locationId");

  useEffect(() => {
    if (target) {
      approveForm.reset({
        locationId: "",
        departmentId: "",
        hourlyRate: 0,
        phone: target.phone ?? "",
      });
    }
  }, [target, approveForm]);

  const onSubmit = approveForm.handleSubmit(async (values) => {
    if (!target) return;
    const result = await approveMutation.mutateAsync({
      id: target.id,
      data: {
        departmentId: values.departmentId,
        hourlyRate: values.hourlyRate,
        phone: values.phone?.trim() || null,
      },
    });
    if (result.success) onClose();
  });

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Duyệt yêu cầu tham gia</DialogTitle>
          <DialogDescription>
            {target ? `${target.firstName} ${target.lastName} (${target.email})` : null}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={approveMutation.isPending}>
              Xác nhận duyệt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
