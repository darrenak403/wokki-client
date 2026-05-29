"use client";

import type { NodeProps } from "@xyflow/react";
import { OrgBaseNode } from "@/app/(app)/[orgId]/admin/workspace/components/nodes/org-base-node";
import type { OrgNodeData, OrgNodeKind } from "@/lib/workspace/org-graph-types";

function LocationNode(props: NodeProps) {
  const data = props.data as OrgNodeData;
  return (
    <OrgBaseNode
      data={data}
      tone="location"
      nodeId={props.id}
      nodeType={(props.type ?? "location") as OrgNodeKind}
    />
  );
}

function DepartmentNode(props: NodeProps) {
  const data = props.data as OrgNodeData;
  return (
    <OrgBaseNode
      data={data}
      tone="department"
      nodeId={props.id}
      nodeType={(props.type ?? "department") as OrgNodeKind}
    />
  );
}

function ManagerNode(props: NodeProps) {
  const data = props.data as OrgNodeData;
  return <OrgBaseNode data={data} tone="manager" />;
}

function EmployeeNode(props: NodeProps) {
  const data = props.data as OrgNodeData;
  return <OrgBaseNode data={data} tone="employee" />;
}

function PendingNode(props: NodeProps) {
  const data = props.data as OrgNodeData;
  return <OrgBaseNode data={data} tone="pending" />;
}

export const orgNodeTypes = {
  location: LocationNode,
  department: DepartmentNode,
  manager: ManagerNode,
  employee: EmployeeNode,
  pendingMembership: PendingNode,
};
