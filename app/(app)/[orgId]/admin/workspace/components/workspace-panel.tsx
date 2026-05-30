"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { DepartmentDetailDrawer } from "@/app/(app)/[orgId]/admin/workspace/components/DepartmentDetailDrawer";
import { EmployeeProfileDialog, type EmployeeProfileSection } from "@/app/(app)/[orgId]/admin/workspace/components/EmployeeProfileDialog";
import { LocationDetailDrawer } from "@/app/(app)/[orgId]/admin/workspace/components/LocationDetailDrawer";
import { OrgGraph } from "@/app/(app)/[orgId]/admin/workspace/components/org-graph";
import { Button } from "@/components/ui/button";
import { fetchDepartments } from "@/lib/api/services/fetchDepartments";
import { fetchEmployees } from "@/lib/api/services/fetchEmployees";
import { fetchLocationManagers } from "@/lib/api/services/fetchLocationManagers";
import { foundationKeys, managerKeys } from "@/lib/api/query-keys";
import { useWorkspaceLocations } from "@/hooks/useWorkspaceLocations";
import { buildOrgGraph } from "@/lib/workspace/org-graph-builder";
import type { OrgFlowNode } from "@/lib/workspace/org-graph-types";
import { writeFoundationSession } from "@/lib/support/foundation/session-context";
import type { DepartmentResponse, EmployeeResponse, LocationResponse } from "@/types/foundation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTransferDepartmentMutation } from "@/hooks/useWorkspaceTransfer";
import { useTenantParams } from "@/hooks/useTenantParams";
import { buildOrgScopedPath } from "@/lib/support/routing/tenant-routes";
import { ROLE_ADMIN } from "@/lib/types/roles";

export type WorkspacePanelProps = {
  canWriteLocations?: boolean;
  canWriteDepartments?: boolean;
  /** PUT chi nhánh hiện có (vd. đổi tên) khi không có quyền tạo/sửa đầy đủ. */
  canEditLocations?: boolean;
  /** PUT phòng ban hiện có khi không có quyền tạo/sửa đầy đủ. */
  canEditDepartments?: boolean;
  canAssignManagers?: boolean;
  canTransferEmployees?: boolean;
  isManagerScope?: boolean;
  /** Branch workspace: render only the `locationId` from the tenant URL. */
  scopeToCurrentLocation?: boolean;
};

export function WorkspacePanel({
  canWriteLocations = false,
  canWriteDepartments = false,
  canEditLocations = false,
  canEditDepartments = false,
  canAssignManagers = false,
  canTransferEmployees = false,
  isManagerScope = false,
  scopeToCurrentLocation = false,
}: WorkspacePanelProps) {
  const queryClient = useQueryClient();
  const { orgId, locationId } = useTenantParams();
  const locationsQuery = useWorkspaceLocations(isManagerScope);
  const allLocations = useMemo(() => locationsQuery.data ?? [], [locationsQuery.data]);
  const scopedLocation =
    scopeToCurrentLocation && locationId
      ? (allLocations.find((location) => location.id === locationId) ?? null)
      : null;
  const locationNotFound =
    scopeToCurrentLocation &&
    !locationsQuery.isLoading &&
    !locationsQuery.isError &&
    Boolean(locationId) &&
    scopedLocation === null;
  const locations = useMemo(() => {
    if (!scopeToCurrentLocation) return allLocations;
    return scopedLocation ? [scopedLocation] : [];
  }, [allLocations, scopeToCurrentLocation, scopedLocation]);

  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  const [locationDrawer, setLocationDrawer] = useState<{
    location: LocationResponse | null;
    isCreate: boolean;
  } | null>(null);
  const [departmentDrawer, setDepartmentDrawer] = useState<{
    department: DepartmentResponse | null;
    location: LocationResponse | null;
    isCreate: boolean;
  } | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
  const [employeeProfileSection, setEmployeeProfileSection] =
    useState<EmployeeProfileSection>("profile");

  const activeExpandedLocations = useMemo(() => {
    if (!scopeToCurrentLocation || !scopedLocation) return expandedLocations;
    return new Set([scopedLocation.id]);
  }, [expandedLocations, scopeToCurrentLocation, scopedLocation]);
  const expandedLocationIds = useMemo(
    () => [...activeExpandedLocations],
    [activeExpandedLocations],
  );
  const expandedDepartmentIds = useMemo(() => [...expandedDepartments], [expandedDepartments]);

  const departmentQueries = useQueries({
    queries: expandedLocationIds.map((locationId) => ({
      queryKey: foundationKeys.departments(locationId),
      queryFn: () => fetchDepartments.list(locationId),
      staleTime: 60_000,
    })),
  });

  const managerQueries = useQueries({
    queries: expandedLocationIds.map((locationId) => ({
      queryKey: managerKeys.byLocation(locationId),
      queryFn: () => fetchLocationManagers.list(locationId),
      staleTime: 300_000,
      enabled: canAssignManagers,
    })),
  });

  const employeeQueries = useQueries({
    queries: expandedDepartmentIds.map((departmentId) => {
      const dept = departmentQueries
        .flatMap((q) => q.data ?? [])
        .find((d) => d.id === departmentId);
      return {
        queryKey: foundationKeys.employees({
          locationId: dept?.locationId ?? "",
          departmentId,
          page: 1,
          pageSize: 50,
        }),
        queryFn: () =>
          fetchEmployees.list({
            locationId: dept?.locationId ?? "",
            departmentId,
            page: 1,
            pageSize: 50,
            includeTerminated: false,
          }),
        enabled: Boolean(dept?.locationId),
        staleTime: 60_000,
      };
    }),
  });

  const departmentsByLocation = useMemo(() => {
    const map: Record<string, DepartmentResponse[]> = {};
    expandedLocationIds.forEach((locId, index) => {
      map[locId] = departmentQueries[index]?.data ?? [];
    });
    return map;
  }, [expandedLocationIds, departmentQueries]);

  const managersByLocation = useMemo(() => {
    const map: Record<string, Awaited<ReturnType<typeof fetchLocationManagers.list>>> = {};
    expandedLocationIds.forEach((locId, index) => {
      if (canAssignManagers) {
        map[locId] = managerQueries[index]?.data ?? [];
      }
    });
    return map;
  }, [expandedLocationIds, managerQueries, canAssignManagers]);

  const employeesByDepartment = useMemo(() => {
    const map: Record<string, EmployeeResponse[]> = {};
    expandedDepartmentIds.forEach((deptId, index) => {
      map[deptId] = employeeQueries[index]?.data?.items ?? [];
    });
    return map;
  }, [expandedDepartmentIds, employeeQueries]);

  const { nodes: graphNodes, edges } = useMemo(
    () =>
      buildOrgGraph({
        locations,
        pending: [],
        managersByLocation,
        departmentsByLocation,
        employeesByDepartment,
        expandedLocations: activeExpandedLocations,
        expandedDepartments,
        showManagers: canAssignManagers,
        lockLocationExpansion: scopeToCurrentLocation,
      }),
    [
      locations,
      managersByLocation,
      departmentsByLocation,
      employeesByDepartment,
      activeExpandedLocations,
      expandedDepartments,
      canAssignManagers,
      scopeToCurrentLocation,
    ],
  );

  const flowNodes = useMemo(
    () =>
      graphNodes.map((node) => ({
        ...node,
        draggable: canTransferEmployees && node.type === "employee",
        data: {
          ...node.data,
          isDraggable: canTransferEmployees && node.type === "employee",
        },
      })),
    [graphNodes, canTransferEmployees],
  );

  const transferDepartmentMutation = useTransferDepartmentMutation();

  const invalidateGraph = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: foundationKeys.locations() });
    void queryClient.invalidateQueries({ queryKey: managerKeys.all });
    void queryClient.invalidateQueries({ queryKey: foundationKeys.all });
    void locationsQuery.refetch();
  }, [queryClient, locationsQuery]);

  const handleEmployeeDropOnDepartment = useCallback(
    async (employeeId: string, fromDepartmentId: string, toDepartmentId: string) => {
      const fromEmp = employeesByDepartment[fromDepartmentId]?.find((e) => e.id === employeeId);
      const targetDept = Object.values(departmentsByLocation)
        .flat()
        .find((d) => d.id === toDepartmentId);

      if (!fromEmp || !targetDept) return;

      if (fromEmp.locationId !== targetDept.locationId) {
        toast.error(
          "Chỉ kéo được giữa các phòng ban cùng chi nhánh. Dùng Điều chuyển để đổi chi nhánh.",
        );
        return;
      }

      try {
        await transferDepartmentMutation.mutateAsync({
          employeeId,
          toDepartmentId,
        });
        invalidateGraph();
      } catch {
        // Toast handled in mutation
      }
    },
    [departmentsByLocation, employeesByDepartment, invalidateGraph, transferDepartmentMutation],
  );

  const handleToggleExpand = useCallback(
    (node: OrgFlowNode) => {
      const { kind, locationId, departmentId } = node.data;
      if (kind === "location" && locationId) {
        if (scopeToCurrentLocation) return;
        setExpandedLocations((prev) => {
          const next = new Set(prev);
          if (next.has(locationId)) next.delete(locationId);
          else next.add(locationId);
          return next;
        });
        return;
      }
      if (kind === "department" && departmentId) {
        setExpandedDepartments((prev) => {
          const next = new Set(prev);
          if (next.has(departmentId)) next.delete(departmentId);
          else next.add(departmentId);
          return next;
        });
      }
    },
    [scopeToCurrentLocation],
  );

  const findEmployeeById = useCallback(
    (employeeId: string) => {
      for (const list of Object.values(employeesByDepartment)) {
        const emp = list.find((e) => e.id === employeeId);
        if (emp) return emp;
      }
      return null;
    },
    [employeesByDepartment]
  );

  const openEmployeeProfile = useCallback(
    (emp: EmployeeResponse, section: EmployeeProfileSection = "profile") => {
      setEmployeeProfileSection(section);
      setSelectedEmployee(emp);
    },
    []
  );

  const handleNodeSelect = useCallback(
    (node: OrgFlowNode) => {
      const { kind, locationId, departmentId, employeeId } = node.data;

      if (kind === "employee" && employeeId) {
        const emp =
          employeesByDepartment[departmentId ?? ""]?.find((e) => e.id === employeeId) ??
          findEmployeeById(employeeId);
        if (emp) openEmployeeProfile(emp, "profile");
        return;
      }

      if (kind === "department" && departmentId && locationId) {
        const dept = departmentsByLocation[locationId]?.find((d) => d.id === departmentId);
        const loc = locations.find((l) => l.id === locationId) ?? null;
        if (dept) {
          writeFoundationSession({
            selectedLocationId: locationId,
            selectedDepartmentId: departmentId,
          });
          setDepartmentDrawer({ department: dept, location: loc, isCreate: false });
        }
        return;
      }

      if (kind === "location" && locationId) {
        const loc = locations.find((l) => l.id === locationId) ?? null;
        if (loc) {
          writeFoundationSession({
            selectedLocationId: locationId,
            selectedDepartmentId: null,
          });
          setLocationDrawer({ location: loc, isCreate: false });
        }
      }
    },
    [locations, departmentsByLocation, employeesByDepartment, findEmployeeById, openEmployeeProfile],
  );

  const createDepartmentLocation =
    scopeToCurrentLocation && scopedLocation
      ? scopedLocation
      : (locations.find((location) => location.id === expandedLocationIds[0]) ?? null);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col">
      <div className="flex shrink-0 items-center justify-end gap-4 border-b border-neutral-200 px-4 py-3 md:px-6 dark:border-neutral-800">
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {canWriteLocations && !scopeToCurrentLocation ? (
            <Button
              type="button"
              onClick={() => setLocationDrawer({ location: null, isCreate: true })}
            >
              <PlusIcon data-icon="inline-start" aria-hidden="true" />
              Thêm chi nhánh
            </Button>
          ) : null}
          {canWriteDepartments && createDepartmentLocation ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDepartmentDrawer({
                  department: null,
                  location: createDepartmentLocation,
                  isCreate: true,
                });
              }}
            >
              <PlusIcon data-icon="inline-start" aria-hidden="true" />
              Thêm phòng ban
            </Button>
          ) : null}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 w-full">
        {locationsQuery.isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Đang tải sơ đồ tổ chức…</p>
        ) : locationsQuery.isError ? (
          <p className="p-4 text-sm text-destructive">Không tải được danh sách chi nhánh.</p>
        ) : locationNotFound ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Không tìm thấy chi nhánh.
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              Chi nhánh này không tồn tại hoặc tài khoản hiện tại chưa có quyền truy cập.
            </p>
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có chi nhánh nào. Thiết lập chi nhánh đầu tiên để bắt đầu.
            </p>
            {canWriteLocations && orgId ? (
              <Link href={buildOrgScopedPath(orgId, ROLE_ADMIN, "onboarding")}>
                <Button type="button">Thiết lập chi nhánh</Button>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="absolute inset-0">
            <OrgGraph
              nodes={flowNodes}
              edges={edges}
              onNodeSelect={handleNodeSelect}
              onToggleExpand={handleToggleExpand}
              canDragEmployees={canTransferEmployees}
              onEmployeeDropOnDepartment={
                canTransferEmployees ? handleEmployeeDropOnDepartment : undefined
              }
            />
          </div>
        )}
      </div>

      <p className="shrink-0 border-t border-neutral-200 px-4 py-2 text-xs text-muted-foreground md:px-6 dark:border-neutral-800">
        Mũi tên trên node để mở rộng phòng ban / nhân viên. Click node để chỉnh sửa.
        {canTransferEmployees
          ? " Kéo thả nhân viên sang phòng ban khác (cùng chi nhánh) để phân lại."
          : null}
      </p>

      <LocationDetailDrawer
        location={locationDrawer?.location ?? null}
        open={locationDrawer !== null}
        isCreate={locationDrawer?.isCreate ?? false}
        canWrite={canWriteLocations}
        canEdit={canEditLocations || canWriteLocations}
        canAssignManagers={canAssignManagers}
        canTransferEmployees={canTransferEmployees}
        onOpenChange={(open) => {
          if (!open) setLocationDrawer(null);
        }}
        onSaved={invalidateGraph}
      />

      <DepartmentDetailDrawer
        department={departmentDrawer?.department ?? null}
        location={departmentDrawer?.location ?? null}
        open={departmentDrawer !== null}
        isCreate={departmentDrawer?.isCreate ?? false}
        canWrite={canWriteDepartments}
        canEdit={canEditDepartments || canWriteDepartments}
        canTransferEmployees={canTransferEmployees}
        onOpenChange={(open) => {
          if (!open) setDepartmentDrawer(null);
        }}
        onSaved={invalidateGraph}
      />

      {selectedEmployee ? (
        <EmployeeProfileDialog
          employee={selectedEmployee}
          open={selectedEmployee !== null}
          initialSection={employeeProfileSection}
          canTransfer={canTransferEmployees}
          onOpenChange={(open) => {
            if (!open) setSelectedEmployee(null);
          }}
          onTransferred={invalidateGraph}
        />
      ) : null}
    </div>
  );
}
