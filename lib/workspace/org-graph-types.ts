import type { Node } from "@xyflow/react";

export type OrgNodeKind =
  | "location"
  | "department"
  | "manager"
  | "employee"
  | "pendingMembership";

export type OrgNodeData = {
  kind: OrgNodeKind;
  label: string;
  subtitle?: string;
  locationId?: string;
  departmentId?: string;
  employeeId?: string;
  membershipId?: string;
  userId?: string;
  isActive?: boolean;
  canExpand?: boolean;
  isExpanded?: boolean;
  /** Employee nodes: enable drag to another department */
  isDraggable?: boolean;
  /** Department nodes: highlight when employee dragged over */
  isDropTarget?: boolean;
};

export type OrgFlowNode = Node<OrgNodeData, OrgNodeKind>;
