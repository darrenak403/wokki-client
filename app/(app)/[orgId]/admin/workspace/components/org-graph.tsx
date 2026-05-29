"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { orgNodeTypes } from "@/app/(app)/[orgId]/admin/workspace/components/nodes";
import { WorkspaceGraphProvider } from "@/app/(app)/[orgId]/admin/workspace/components/workspace-graph-context";
import { layoutOrgGraph } from "@/lib/workspace/layout-graph";
import type { OrgFlowNode } from "@/lib/workspace/org-graph-types";

type OrgGraphProps = {
  nodes: OrgFlowNode[];
  edges: Edge[];
  onNodeSelect: (node: OrgFlowNode) => void;
  onToggleExpand: (node: OrgFlowNode) => void;
  canDragEmployees?: boolean;
  onEmployeeDropOnDepartment?: (
    employeeId: string,
    fromDepartmentId: string,
    toDepartmentId: string,
  ) => void;
};

function isDepartmentNode(node: Node): node is OrgFlowNode {
  return node.type === "department";
}

function isEmployeeNode(node: Node): node is OrgFlowNode {
  return node.type === "employee";
}

function OrgGraphInner({
  nodes: inputNodes,
  edges: inputEdges,
  onNodeSelect,
  onToggleExpand,
  canDragEmployees = false,
  onEmployeeDropOnDepartment,
}: OrgGraphProps) {
  const { getIntersectingNodes } = useReactFlow();

  const layouted = useMemo(
    () => layoutOrgGraph(inputNodes, inputEdges),
    [inputNodes, inputEdges],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layouted);
  const [edges, setEdges, onEdgesChange] = useEdgesState(inputEdges);

  useEffect(() => {
    setNodes(layouted);
    setEdges(inputEdges);
  }, [layouted, inputEdges, setNodes, setEdges]);

  const resetLayout = useCallback(() => {
    setNodes(layouted);
  }, [layouted, setNodes]);

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    onNodeSelect(node as OrgFlowNode);
  };

  const handleNodeDrag: OnNodeDrag<OrgFlowNode> = useCallback(
    (_event, draggedNode) => {
      if (!canDragEmployees || !isEmployeeNode(draggedNode)) return;

      const intersecting = getIntersectingNodes(draggedNode);
      const targetDeptId = intersecting.find(isDepartmentNode)?.data.departmentId;

      setNodes((current) =>
        current.map((node) => {
          if (node.type !== "department") {
            return { ...node, data: { ...node.data, isDropTarget: false } };
          }
          return {
            ...node,
            data: {
              ...node.data,
              isDropTarget: node.data.departmentId === targetDeptId,
            },
          };
        }),
      );
    },
    [canDragEmployees, getIntersectingNodes, setNodes],
  );

  const handleNodeDragStop: OnNodeDrag<OrgFlowNode> = useCallback(
    (_event, draggedNode) => {
      setNodes((current) =>
        current.map((node) => ({
          ...node,
          data: { ...node.data, isDropTarget: false },
        })),
      );

      if (!canDragEmployees || !isEmployeeNode(draggedNode) || !onEmployeeDropOnDepartment) {
        resetLayout();
        return;
      }

      const fromDepartmentId = draggedNode.data.departmentId;
      const employeeId = draggedNode.data.employeeId;
      const targetDept = getIntersectingNodes(draggedNode).find(isDepartmentNode);

      resetLayout();

      if (!employeeId || !fromDepartmentId || !targetDept?.data.departmentId) return;

      const toDepartmentId = targetDept.data.departmentId;
      if (fromDepartmentId === toDepartmentId) return;

      onEmployeeDropOnDepartment(employeeId, fromDepartmentId, toDepartmentId);
    },
    [
      canDragEmployees,
      getIntersectingNodes,
      onEmployeeDropOnDepartment,
      resetLayout,
      setNodes,
    ],
  );

  const actions = useMemo(() => ({ onToggleExpand }), [onToggleExpand]);

  return (
    <WorkspaceGraphProvider value={actions}>
      <div className="h-full min-h-0 w-full bg-muted/20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onNodeDrag={handleNodeDrag}
          onNodeDragStop={handleNodeDragStop}
          nodeTypes={orgNodeTypes}
          nodesConnectable={false}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} />
          <Controls />
          <MiniMap zoomable pannable className="!bg-background/90" />
        </ReactFlow>
      </div>
    </WorkspaceGraphProvider>
  );
}

export function OrgGraph(props: OrgGraphProps) {
  return (
    <ReactFlowProvider>
      <OrgGraphInner {...props} />
    </ReactFlowProvider>
  );
}
