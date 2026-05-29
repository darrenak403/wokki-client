import type { Edge } from "@xyflow/react";
import type { OrgFlowNode } from "@/lib/workspace/org-graph-types";
import type { LocationResponse } from "@/types/foundation";

export function buildManagerLocationSelectionGraph(
  locations: LocationResponse[],
  selectedLocationIds: readonly string[],
  options?: {
    draftName?: string | null;
    draftAddress?: string | null;
  }
): { nodes: OrgFlowNode[]; edges: Edge[] } {
  const nodes: OrgFlowNode[] = locations.map((location) => ({
    id: `location:${location.id}`,
    type: "location",
    position: { x: 0, y: 0 },
    data: {
      kind: "location",
      label: location.name,
      subtitle: location.address,
      locationId: location.id,
      isActive: location.isActive,
      canExpand: false,
      isExpanded: false,
      isSelected: selectedLocationIds.includes(location.id),
    },
  }));

  if (options?.draftName != null) {
    const draftLabel = options.draftName.trim() || "Chi nhánh mới";
    const draftSubtitle = options.draftAddress?.trim() || "Sắp tạo";
    nodes.push({
      id: "location:preview",
      type: "location",
      position: { x: 0, y: 0 },
      data: {
        kind: "location",
        label: draftLabel,
        subtitle: draftSubtitle,
        isActive: true,
        canExpand: false,
        isExpanded: false,
        isPreview: true,
      },
    });
  }

  return { nodes, edges: [] };
}
