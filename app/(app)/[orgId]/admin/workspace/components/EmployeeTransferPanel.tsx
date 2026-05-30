"use client";

import { useId, useMemo, useState } from "react";
import { ArrowRightLeftIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { useLocationsQuery } from "@/hooks/useLocations";
import {
  useTransferDepartmentMutation,
  useTransferLocationMutation,
} from "@/hooks/useWorkspaceTransfer";
import { mapFoundationError } from "@/lib/support/foundation/map-errors";
import { mapMembershipError } from "@/lib/support/membership/map-errors";
import type { EmployeeResponse } from "@/types/foundation";

export function employeeDisplayName(employee: EmployeeResponse): string {
  return `${employee.lastName} ${employee.firstName}`.trim() || employee.email;
}

type EmployeeTransferPanelProps = {
  employee: EmployeeResponse;
  onTransferred?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
};

export function EmployeeTransferPanel({
  employee,
  onTransferred,
  onCancel,
  showCancel = false,
}: EmployeeTransferPanelProps) {
  const idPrefix = useId();
  const [targetLocationId, setTargetLocationId] = useState(employee.locationId ?? "");
  const [targetDepartmentId, setTargetDepartmentId] = useState(employee.departmentId ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const locationsQuery = useLocationsQuery();
  const departmentsQuery = useDepartmentsQuery(targetLocationId);
  const transferLocationMutation = useTransferLocationMutation();
  const transferDepartmentMutation = useTransferDepartmentMutation();

  const targetLocations = useMemo(
    () =>
      (locationsQuery.data ?? []).filter(
        (location) => location.isActive || location.id === employee.locationId
      ),
    [employee.locationId, locationsQuery.data]
  );
  const activeDepartments = useMemo(
    () =>
      (departmentsQuery.data ?? []).filter(
        (department) =>
          department.isActive ||
          (department.locationId === employee.locationId && department.id === employee.departmentId)
      ),
    [departmentsQuery.data, employee.departmentId, employee.locationId]
  );

  const selectedLocation = targetLocations.find((location) => location.id === targetLocationId);
  const selectedDepartment = activeDepartments.find(
    (department) => department.id === targetDepartmentId
  );
  const isLocationTransfer = targetLocationId !== employee.locationId;
  const isDepartmentTransfer = targetDepartmentId !== employee.departmentId || isLocationTransfer;
  const isNoop = !isLocationTransfer && !isDepartmentTransfer;
  const isPending = transferLocationMutation.isPending || transferDepartmentMutation.isPending;
  const locationListError = locationsQuery.isError
    ? mapFoundationError(locationsQuery.error)
    : null;
  const departmentListError = departmentsQuery.isError
    ? mapFoundationError(departmentsQuery.error)
    : null;
  const canSubmit =
    Boolean(targetLocationId && targetDepartmentId) &&
    !isNoop &&
    !locationsQuery.isLoading &&
    !departmentsQuery.isLoading &&
    !isPending;

  const locationItems = useMemo(
    () =>
      targetLocations.map((location) => ({
        value: location.id,
        label: `${location.name}${!location.isActive ? " (ngừng hoạt động)" : ""}`,
      })),
    [targetLocations]
  );

  const departmentItems = useMemo(
    () =>
      activeDepartments.map((department) => ({
        value: department.id,
        label: `${department.name}${!department.isActive ? " (ngừng hoạt động)" : ""}`,
      })),
    [activeDepartments]
  );

  const locationFieldId = `${idPrefix}-transfer-location`;
  const departmentFieldId = `${idPrefix}-transfer-department`;

  const handleLocationChange = (value: string | null) => {
    const nextLocationId = value ?? "";
    setTargetLocationId(nextLocationId);
    setTargetDepartmentId(nextLocationId === employee.locationId ? (employee.departmentId ?? "") : "");
    setSubmitError(null);
  };

  const handleDepartmentChange = (value: string | null) => {
    setTargetDepartmentId(value ?? "");
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitError(null);
    try {
      if (isLocationTransfer) {
        await transferLocationMutation.mutateAsync({
          employeeId: employee.id,
          toLocationId: targetLocationId,
        });
      }
      if (isDepartmentTransfer) {
        await transferDepartmentMutation.mutateAsync({
          employeeId: employee.id,
          toDepartmentId: targetDepartmentId,
        });
      }
      onTransferred?.();
    } catch (error) {
      setSubmitError(mapMembershipError(error));
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Chọn chi nhánh và phòng ban mới cho{" "}
        <span className="font-medium text-foreground">{employeeDisplayName(employee)}</span>.
        Manager chỉ thao tác được trong phạm vi chi nhánh được phân quyền.
      </p>

      <FieldGroup>
        <Field data-invalid={Boolean(locationListError)}>
          <FieldLabel htmlFor={locationFieldId}>Chi nhánh</FieldLabel>
          {locationsQuery.isLoading ? (
            <Skeleton className="h-8 w-full" aria-label="Đang tải chi nhánh" />
          ) : (
            <Select
              value={targetLocationId}
              onValueChange={handleLocationChange}
              disabled={isPending || targetLocations.length === 0}
              items={locationItems}
            >
              <SelectTrigger
                id={locationFieldId}
                className="w-full"
                aria-invalid={Boolean(locationListError)}
              >
                <SelectValue
                  placeholder={
                    targetLocations.length === 0 ? "Không có chi nhánh khả dụng" : "Chọn chi nhánh"
                  }
                >
                  {(value) =>
                    locationItems.find((item) => item.value === value)?.label ??
                    (value === employee.locationId ? employee.locationName : null)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {targetLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id} disabled={!location.isActive}>
                      {location.name}
                      {!location.isActive ? " (ngừng hoạt động)" : null}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <FieldDescription>
            Danh sách chi nhánh tuân theo phạm vi Admin/Manager từ backend.
          </FieldDescription>
        </Field>

        <Field data-invalid={Boolean(departmentListError)}>
          <FieldLabel htmlFor={departmentFieldId}>Phòng ban</FieldLabel>
          {departmentsQuery.isLoading ? (
            <Skeleton className="h-8 w-full" aria-label="Đang tải phòng ban" />
          ) : (
            <Select
              value={targetDepartmentId}
              onValueChange={handleDepartmentChange}
              disabled={isPending || !targetLocationId || activeDepartments.length === 0}
              items={departmentItems}
            >
              <SelectTrigger
                id={departmentFieldId}
                className="w-full"
                aria-invalid={Boolean(departmentListError)}
              >
                <SelectValue
                  placeholder={
                    activeDepartments.length === 0
                      ? "Chưa có phòng ban hoạt động"
                      : "Chọn phòng ban"
                  }
                >
                  {(value) =>
                    departmentItems.find((item) => item.value === value)?.label ??
                    (value === employee.departmentId ? employee.departmentName : null)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {activeDepartments.map((department) => (
                    <SelectItem
                      key={department.id}
                      value={department.id}
                      disabled={!department.isActive}
                    >
                      {department.name}
                      {!department.isActive ? " (ngừng hoạt động)" : null}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <FieldDescription>
            Nhân viên cần thuộc đúng chi nhánh và phòng ban trước khi được xếp lịch chính thức.
          </FieldDescription>
        </Field>
      </FieldGroup>

      {selectedLocation && selectedDepartment ? (
        <Alert role="status">
          <AlertDescription>
            Sau khi điều chuyển: {selectedLocation.name} / {selectedDepartment.name}.
          </AlertDescription>
        </Alert>
      ) : null}

      {locationListError || departmentListError || submitError ? (
        <p className="text-sm text-destructive" role="alert">
          {locationListError ?? departmentListError ?? submitError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        {showCancel && onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Hủy
          </Button>
        ) : null}
        <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
          <ArrowRightLeftIcon data-icon="inline-start" aria-hidden="true" />
          {isPending ? "Đang điều chuyển…" : "Điều chuyển"}
        </Button>
      </div>
    </div>
  );
}
