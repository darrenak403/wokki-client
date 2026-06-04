"use client";

import { useMemo, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { DemoteManagerConfirmDialog } from "@/app/(app)/[orgId]/admin/workspace/components/DemoteManagerConfirmDialog";
import { PromoteManagerConfirmDialog } from "@/app/(app)/[orgId]/admin/workspace/components/PromoteManagerConfirmDialog";
import { LocationSelect } from "@/components/shared/location-select";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepartmentSelect } from "@/components/shared/department-select";
import { useEmployeeRoleTransitionMutation } from "@/hooks/useEmployeeRoleTransition";
import { useLocationsQuery } from "@/hooks/useLocations";
import { ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";
import type { EmployeeResponse } from "@/types/foundation";

const ROLE_LABELS: Record<typeof ROLE_USER | typeof ROLE_MANAGER, string> = {
  [ROLE_MANAGER]: "Quản lý chi nhánh",
  [ROLE_USER]: "Nhân viên (phòng ban)",
};

function transitionRoleLabel(role: string): string {
  if (role === ROLE_MANAGER || role === ROLE_USER) return ROLE_LABELS[role];
  return role;
}

export type PromoteManagerConfirmRequest = {
  locationId: string;
  branchName: string;
};

export type DemoteManagerConfirmRequest = {
  locationId: string;
  departmentId: string;
};

type EmployeeRoleTransitionPanelProps = {
  employee: EmployeeResponse;
  onCompleted?: () => void;
  /** When set, promote opens the shared confirm dialog in the parent (workspace). */
  onRequestPromoteConfirm?: (request: PromoteManagerConfirmRequest) => void;
  /** When set, demote opens the shared confirm dialog in the parent (workspace). */
  onRequestDemoteConfirm?: (request: DemoteManagerConfirmRequest) => void;
};

export function EmployeeRoleTransitionPanel({
  employee,
  onCompleted,
  onRequestPromoteConfirm,
  onRequestDemoteConfirm,
}: EmployeeRoleTransitionPanelProps) {
  const transitionMutation = useEmployeeRoleTransitionMutation();
  const locationsQuery = useLocationsQuery();
  const locations = useMemo(() => locationsQuery.data ?? [], [locationsQuery.data]);
  const locationItems = useMemo(
    () =>
      locations.map((loc) => ({
        value: loc.id,
        label: loc.isActive ? loc.name : `${loc.name} (ngừng hoạt động)`,
      })),
    [locations],
  );

  const isCurrentlyManager = employee.role === ROLE_MANAGER;
  const targetRole = isCurrentlyManager ? ROLE_USER : ROLE_MANAGER;
  const isPromote = targetRole === ROLE_MANAGER;
  const isDemote = targetRole === ROLE_USER;

  const [locationId, setLocationId] = useState(employee.locationId ?? "");
  const [demoteLocationId, setDemoteLocationId] = useState(employee.locationId ?? "");
  const [departmentId, setDepartmentId] = useState(employee.departmentId ?? "");
  const [confirmPromoteOpen, setConfirmPromoteOpen] = useState(false);
  const [confirmDemoteOpen, setConfirmDemoteOpen] = useState(false);

  const resolvedLocationId = locationId || employee.locationId || "";
  const selectedLocationLabel = useMemo(() => {
    const fromList = locationItems.find((item) => item.value === resolvedLocationId)?.label;
    if (fromList) return fromList.replace(/ \(ngừng hoạt động\)$/, "");
    if (resolvedLocationId === employee.locationId && employee.locationName) {
      return employee.locationName;
    }
    return "chi nhánh đã chọn";
  }, [locationItems, resolvedLocationId, employee.locationId, employee.locationName]);

  const handleDemote = async (targetDepartmentId: string) => {
    await transitionMutation.mutateAsync({
      employeeId: employee.id,
      data: {
        targetRole: ROLE_USER,
        departmentId: targetDepartmentId,
      },
    });
    setConfirmDemoteOpen(false);
    onCompleted?.();
  };

  const handlePromote = async () => {
    await transitionMutation.mutateAsync({
      employeeId: employee.id,
      data: {
        targetRole: ROLE_MANAGER,
        locationId: resolvedLocationId || undefined,
      },
    });
    setConfirmPromoteOpen(false);
    onCompleted?.();
  };

  const handleSubmit = async () => {
    if (isPromote) {
      if (!resolvedLocationId) return;
      if (onRequestPromoteConfirm) {
        onRequestPromoteConfirm({
          locationId: resolvedLocationId,
          branchName: selectedLocationLabel,
        });
      } else {
        setConfirmPromoteOpen(true);
      }
      return;
    }

    if (isDemote) {
      if (!demoteLocationId || !departmentId) return;
      if (onRequestDemoteConfirm) {
        onRequestDemoteConfirm({
          locationId: demoteLocationId,
          departmentId,
        });
      } else {
        setConfirmDemoteOpen(true);
      }
    }
  };

  const canSubmit =
    !transitionMutation.isPending &&
    (isPromote
      ? Boolean(locationId || employee.locationId)
      : Boolean(demoteLocationId && departmentId));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Chuyển vai trò đồng bộ chi nhánh / phòng ban trên hệ thống. Người dùng cần đăng nhập lại sau khi
        lưu.
      </p>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200/80 bg-muted/40 px-4 py-3 text-sm dark:border-neutral-700">
        <span className="font-medium text-muted-foreground">
          {transitionRoleLabel(employee.role)}
        </span>
        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="font-semibold text-foreground">{ROLE_LABELS[targetRole]}</span>
      </div>

      <FieldGroup>
        {isPromote ? (
          <Field>
            <FieldLabel>Chi nhánh quản lý</FieldLabel>
            <Select
              value={locationId}
              onValueChange={(value) => setLocationId(value ?? "")}
              items={locationItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn chi nhánh">
                  {(value) =>
                    locationItems.find((item) => item.value === value)?.label ??
                    (value === employee.locationId ? employee.locationName : null)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id} disabled={!loc.isActive}>
                    {loc.name}
                    {!loc.isActive ? " (ngừng hoạt động)" : null}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}

        {isDemote ? (
          <>
            <Field>
              <FieldLabel>Chi nhánh</FieldLabel>
              <LocationSelect
                value={demoteLocationId || null}
                onChange={(id) => {
                  setDemoteLocationId(id ?? "");
                  setDepartmentId("");
                }}
              />
            </Field>
            <Field>
              <FieldLabel>Phòng ban</FieldLabel>
              <DepartmentSelect
                locationId={demoteLocationId || null}
                value={departmentId || null}
                onChange={(id) => setDepartmentId(id ?? "")}
                allowEmpty={false}
              />
            </Field>
          </>
        ) : null}
      </FieldGroup>

      <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
        {transitionMutation.isPending
          ? "Đang lưu…"
          : `Chuyển thành ${ROLE_LABELS[targetRole]}`}
      </Button>

      {isPromote && !onRequestPromoteConfirm ? (
        <PromoteManagerConfirmDialog
          open={confirmPromoteOpen}
          onOpenChange={setConfirmPromoteOpen}
          employee={employee}
          branchName={selectedLocationLabel}
          isPending={transitionMutation.isPending}
          onConfirm={handlePromote}
        />
      ) : null}

      {isDemote && !onRequestDemoteConfirm ? (
        <DemoteManagerConfirmDialog
          open={confirmDemoteOpen}
          onOpenChange={setConfirmDemoteOpen}
          employee={employee}
          initialLocationId={demoteLocationId}
          initialDepartmentId={departmentId}
          isPending={transitionMutation.isPending}
          onConfirm={handleDemote}
        />
      ) : null}
    </div>
  );
}
