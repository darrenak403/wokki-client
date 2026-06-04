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
  canDragManagers?: boolean;
  onEmployeeDropOnDepartment?: (
    employeeId: string,
    fromDepartmentId: string,
    toDepartmentId: string,
  ) => void;
  onEmployeeDropOnLocation?: (employeeId: string, toLocationId: string) => void;
  onManagerDropOnDepartment?: (payload: {
    userId: string;
    employeeId?: string;
    toDepartmentId: string;
  }) => void;
  onManagerDropMissed?: () => void;
  showMiniMap?: boolean;
  showControls?: boolean;
};

function isDepartmentNode(node: Node): node is OrgFlowNode {
  return node.type === "department";
}

function isLocationNode(node: Node): node is OrgFlowNode {
  return node.type === "location";
}

function isEmployeeNode(node: Node): node is OrgFlowNode {
  return node.type === "employee";
}

function isManagerNode(node: Node): node is OrgFlowNode {
  return node.type === "manager";
}

function OrgGraphInner({
  nodes: inputNodes,
  edges: inputEdges,
  onNodeSelect,
  onToggleExpand,
  canDragEmployees = false,
  canDragManagers = false,
  onEmployeeDropOnDepartment,
  onEmployeeDropOnLocation,
  onManagerDropOnDepartment,
  onManagerDropMissed,
  showMiniMap = true,
  showControls = true,
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

  const clearDropTargets = useCallback(() => {
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        data: { ...node.data, isDropTarget: false },
      })),
    );
  }, [setNodes]);

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    onNodeSelect(node as OrgFlowNode);
  };

  const handleNodeDrag: OnNodeDrag<OrgFlowNode> = useCallback(
    (_event, draggedNode) => {
      const isEmp = canDragEmployees && isEmployeeNode(draggedNode);
      const isMgr = canDragManagers && isManagerNode(draggedNode);
      if (!isEmp && !isMgr) return;

      const intersecting = getIntersectingNodes(draggedNode);
      const targetDeptId = intersecting.find(isDepartmentNode)?.data.departmentId;
      const targetLocId = intersecting.find(isLocationNode)?.data.locationId;

      setNodes((current) =>
        current.map((node) => {
          if (node.type === "department") {
            return {
              ...node,
              data: {
                ...node.data,
                isDropTarget: node.data.departmentId === targetDeptId,
              },
            };
          }
          if (node.type === "location") {
            return {
              ...node,
              data: {
                ...node.data,
                isDropTarget: node.data.locationId === targetLocId,
              },
            };
          }
          return { ...node, data: { ...node.data, isDropTarget: false } };
        }),
      );
    },
    [canDragEmployees, canDragManagers, getIntersectingNodes, setNodes],
  );

  const handleNodeDragStop: OnNodeDrag<OrgFlowNode> = useCallback(
    (_event, draggedNode) => {
      clearDropTargets();

      const intersecting = getIntersectingNodes(draggedNode);
      resetLayout();

      if (isEmployeeNode(draggedNode) && canDragEmployees) {
        const fromDepartmentId = draggedNode.data.departmentId;
        const employeeId = draggedNode.data.employeeId;
        const targetLoc = intersecting.find(isLocationNode);
        const targetDept = intersecting.find(isDepartmentNode);

        // Promote to manager: location wins when both branch and department overlap.
        if (employeeId && targetLoc?.data.locationId && onEmployeeDropOnLocation) {
          onEmployeeDropOnLocation(employeeId, targetLoc.data.locationId);
          return;
        }

        if (
          employeeId &&
          fromDepartmentId &&
          targetDept?.data.departmentId &&
          onEmployeeDropOnDepartment
        ) {
          const toDepartmentId = targetDept.data.departmentId;
          if (fromDepartmentId !== toDepartmentId) {
            onEmployeeDropOnDepartment(employeeId, fromDepartmentId, toDepartmentId);
          }
        }
        return;
      }

      if (isManagerNode(draggedNode) && canDragManagers) {
        const userId = draggedNode.data.userId;
        const employeeId = draggedNode.data.employeeId;
        const targetDept = intersecting.find(isDepartmentNode);
        if (userId && targetDept?.data.departmentId && onManagerDropOnDepartment) {
          onManagerDropOnDepartment({
            userId,
            employeeId,
            toDepartmentId: targetDept.data.departmentId,
          });
          return;
        }
        if (userId && onManagerDropMissed && !targetDept?.data.departmentId) {
          onManagerDropMissed();
        }
      }
    },
    [
      canDragEmployees,
      canDragManagers,
      clearDropTargets,
      getIntersectingNodes,
      onEmployeeDropOnDepartment,
      onEmployeeDropOnLocation,
      onManagerDropOnDepartment,
      onManagerDropMissed,
      resetLayout,
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
          {showControls ? <Controls /> : null}
          {showMiniMap ? <MiniMap zoomable pannable className="!bg-background/90" /> : null}
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
