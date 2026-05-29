"use client";

import { useState } from "react";
import { Building2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartmentsQuery } from "@/hooks/useDepartments";
import { useTransferDepartmentMutation } from "@/hooks/useWorkspaceTransfer";
import { mapMembershipError } from "@/lib/support/membership/map-errors";
import type { LocationMembershipResponse } from "@/types/location-membership";

type AssignDepartmentAfterApproveDialogProps = {
  membership: LocationMembershipResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function employeeName(membership: LocationMembershipResponse): string {
  return `${membership.employeeFirstName} ${membership.employeeLastName}`.trim();
}

export function AssignDepartmentAfterApproveDialog({
  membership,
  open,
  onOpenChange,
}: AssignDepartmentAfterApproveDialogProps) {
  const [departmentId, setDepartmentId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    data: departments = [],
    isLoading,
    isError,
    error,
  } = useDepartmentsQuery(membership.locationId);
  const transferMutation = useTransferDepartmentMutation();
  const activeDepartments = departments.filter((department) => department.isActive);
  const listError = isError ? mapMembershipError(error) : null;

  const close = () => {
    onOpenChange(false);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!departmentId) return;
    setSubmitError(null);
    try {
      await transferMutation.mutateAsync({
        employeeId: membership.employeeId,
        toDepartmentId: departmentId,
      });
      close();
    } catch (error) {
      setSubmitError(mapMembershipError(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phân vào phòng ban</DialogTitle>
          <DialogDescription>
            {employeeName(membership)} đã được duyệt vào {membership.locationName}. Chọn phòng ban
            để nhân viên có thể được quản lý và xếp lịch đúng phạm vi.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="approved-membership-department">Phòng ban</FieldLabel>
            {isLoading ? (
              <Skeleton className="h-8 w-full" aria-label="Đang tải phòng ban" />
            ) : (
              <Select
                value={departmentId}
                onValueChange={(value) => setDepartmentId(value ?? "")}
                disabled={transferMutation.isPending || activeDepartments.length === 0}
              >
                <SelectTrigger id="approved-membership-department" className="w-full">
                  <SelectValue
                    placeholder={
                      activeDepartments.length === 0
                        ? "Chưa có phòng ban hoạt động"
                        : "Chọn phòng ban"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {activeDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            <FieldDescription>
              Bước này không tạo lịch làm việc; lịch chính thức vẫn do Admin/Manager xếp và công bố.
            </FieldDescription>
          </Field>
        </FieldGroup>

        {listError ? (
          <p className="text-sm text-destructive" role="alert">
            {listError}
          </p>
        ) : null}
        {submitError ? (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={transferMutation.isPending}
          >
            Để sau
          </Button>
          <Button
            type="button"
            disabled={!departmentId || isLoading || transferMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            <Building2Icon data-icon="inline-start" aria-hidden="true" />
            {transferMutation.isPending ? "Đang phân..." : "Phân phòng ban"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
