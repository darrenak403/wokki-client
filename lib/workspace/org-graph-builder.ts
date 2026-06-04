import type { Edge } from "@xyflow/react";
import type { OrgFlowNode } from "@/lib/workspace/org-graph-types";
import type { DepartmentResponse, EmployeeResponse, LocationResponse } from "@/types/foundation";
import type {
  LocationManagerResponse,
  LocationMembershipResponse,
} from "@/types/location-membership";

export type BuildOrgGraphInput = {
  locations: LocationResponse[];
  pending: LocationMembershipResponse[];
  managersByLocation: Record<string, LocationManagerResponse[]>;
  /** userId → employeeId for demote drag on manager nodes */
  employeeIdByUserId?: Record<string, string>;
  departmentsByLocation: Record<string, DepartmentResponse[]>;
  employeesByDepartment: Record<string, EmployeeResponse[]>;
  expandedLocations: Set<string>;
  expandedDepartments: Set<string>;
  showManagers: boolean;
  lockLocationExpansion?: boolean;
};

export type BuildOrgGraphResult = {
  nodes: OrgFlowNode[];
  edges: Edge[];
};

export function buildOrgGraph(input: BuildOrgGraphInput): BuildOrgGraphResult {
  const nodes: OrgFlowNode[] = [];
  const edges: Edge[] = [];

  for (const loc of input.locations) {
    const locId = `location:${loc.id}`;
    const isExpanded = input.expandedLocations.has(loc.id);

    nodes.push({
      id: locId,
      type: "location",
      position: { x: 0, y: 0 },
      data: {
        kind: "location",
        label: loc.name,
        subtitle: loc.address,
        locationId: loc.id,
        isActive: loc.isActive,
        canExpand: !input.lockLocationExpansion,
        isExpanded,
      },
    });

    if (!isExpanded) continue;

    if (input.showManagers) {
      for (const mgr of input.managersByLocation[loc.id] ?? []) {
        const mgrId = `manager:${loc.id}:${mgr.userId}`;
        nodes.push({
          id: mgrId,
          type: "manager",
          position: { x: 0, y: 0 },
          data: {
            kind: "manager",
            label: mgr.userEmail,
            subtitle: "Manager",
            locationId: loc.id,
            userId: mgr.userId,
            employeeId: mgr.employeeId ?? input.employeeIdByUserId?.[mgr.userId],
          },
        });
        edges.push({ id: `${locId}->${mgrId}`, source: locId, target: mgrId });
      }
    }

    for (const dept of input.departmentsByLocation[loc.id] ?? []) {
      const deptId = `department:${dept.id}`;
      const deptExpanded = input.expandedDepartments.has(dept.id);

      nodes.push({
        id: deptId,
        type: "department",
        position: { x: 0, y: 0 },
        data: {
          kind: "department",
          label: dept.name,
          locationId: loc.id,
          departmentId: dept.id,
          isActive: dept.isActive,
          canExpand: true,
          isExpanded: deptExpanded,
        },
      });
      edges.push({ id: `${locId}->${deptId}`, source: locId, target: deptId });

      if (!deptExpanded) continue;

      for (const emp of input.employeesByDepartment[dept.id] ?? []) {
        const empId = `employee:${dept.id}:${emp.id}`;
        nodes.push({
          id: empId,
          type: "employee",
          position: { x: 0, y: 0 },
          data: {
            kind: "employee",
            label: `${emp.firstName} ${emp.lastName}`.trim(),
            subtitle: emp.departmentName ?? emp.position,
            locationId: loc.id,
            departmentId: dept.id,
            employeeId: emp.id,
          },
        });
        edges.push({ id: `${deptId}->${empId}`, source: deptId, target: empId });
      }
    }
  }

  for (const membership of input.pending) {
    const pendingId = `pending:${membership.id}`;
    const locId = `location:${membership.locationId}`;
    nodes.push({
      id: pendingId,
      type: "pendingMembership",
      position: { x: 0, y: 0 },
      data: {
        kind: "pendingMembership",
        label: `${membership.employeeFirstName} ${membership.employeeLastName}`.trim(),
        subtitle: "Chờ duyệt",
        locationId: membership.locationId,
        membershipId: membership.id,
      },
    });
    if (input.locations.some((l) => l.id === membership.locationId)) {
      edges.push({
        id: `${locId}->${pendingId}`,
        source: locId,
        target: pendingId,
        style: { strokeDasharray: "4 4" },
      });
    }
  }

  return { nodes, edges };
}
