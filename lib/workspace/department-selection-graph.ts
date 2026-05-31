import type { Edge } from "@xyflow/react";
import type { OrgFlowNode } from "@/lib/workspace/org-graph-types";
import type { DepartmentResponse } from "@/types/foundation";

export type DepartmentSelectionGraphInput = {
  locationId: string;
  locationName: string;
  locationAddress?: string | null;
  departments: DepartmentResponse[];
  selectedDepartmentId?: string | null;
  /** When set, renders a dashed preview node while creating a new department. */
  draftName?: string | null;
};

export function buildDepartmentSelectionGraph(input: DepartmentSelectionGraphInput): {
  nodes: OrgFlowNode[];
  edges: Edge[];
} {
  const nodes: OrgFlowNode[] = [];
  const edges: Edge[] = [];
  const locNodeId = `location:${input.locationId}`;

  nodes.push({
    id: locNodeId,
    type: "location",
    position: { x: 0, y: 0 },
    data: {
      kind: "location",
      label: input.locationName,
      subtitle: input.locationAddress ?? undefined,
      locationId: input.locationId,
      isActive: true,
      canExpand: true,
      isExpanded: true,
    },
  });

  for (const dept of input.departments) {
    const deptNodeId = `department:${dept.id}`;
    nodes.push({
      id: deptNodeId,
      type: "department",
      position: { x: 0, y: 0 },
      data: {
        kind: "department",
        label: dept.name,
        locationId: input.locationId,
        departmentId: dept.id,
        isActive: dept.isActive,
        canExpand: false,
        isExpanded: false,
        isSelected: input.selectedDepartmentId === dept.id,
      },
    });
    edges.push({ id: `${locNodeId}->${deptNodeId}`, source: locNodeId, target: deptNodeId });
  }

  if (input.draftName != null) {
    const draftLabel = input.draftName.trim() || "Phòng ban mới";
    const draftNodeId = "department:preview";
    nodes.push({
      id: draftNodeId,
      type: "department",
      position: { x: 0, y: 0 },
      data: {
        kind: "department",
        label: draftLabel,
        subtitle: "Sắp tạo",
        locationId: input.locationId,
        isActive: true,
        canExpand: false,
        isExpanded: false,
        isPreview: true,
      },
    });
    edges.push({ id: `${locNodeId}->${draftNodeId}`, source: locNodeId, target: draftNodeId });
  }

  return { nodes, edges };
}
