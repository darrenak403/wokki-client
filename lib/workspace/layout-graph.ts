import dagre from "dagre";
import type { Edge } from "@xyflow/react";
import { Position } from "@xyflow/react";
import type { OrgFlowNode } from "@/lib/workspace/org-graph-types";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 56;

/**
 * LR: hierarchy grows left → right; siblings (e.g. many employees under one dept)
 * stack vertically instead of spreading horizontally (TB would fan them wide).
 */
export function layoutOrgGraph(nodes: OrgFlowNode[], edges: Edge[]): OrgFlowNode[] {
  if (nodes.length === 0) return nodes;

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "LR",
    nodesep: 20,
    ranksep: 64,
    marginx: 24,
    marginy: 24,
  });

  for (const node of nodes) {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);

  return nodes.map((node) => {
    const positioned = graph.node(node.id);
    if (!positioned) return node;
    return {
      ...node,
      position: {
        x: positioned.x - NODE_WIDTH / 2,
        y: positioned.y - NODE_HEIGHT / 2,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });
}
