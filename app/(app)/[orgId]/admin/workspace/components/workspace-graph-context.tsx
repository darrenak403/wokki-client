"use client";

import { createContext, useContext } from "react";
import type { OrgFlowNode } from "@/lib/workspace/org-graph-types";

type WorkspaceGraphActions = {
  onToggleExpand: (node: OrgFlowNode) => void;
};

const WorkspaceGraphContext = createContext<WorkspaceGraphActions | null>(null);

export function WorkspaceGraphProvider({
  value,
  children,
}: {
  value: WorkspaceGraphActions;
  children: React.ReactNode;
}) {
  return <WorkspaceGraphContext.Provider value={value}>{children}</WorkspaceGraphContext.Provider>;
}

export function useWorkspaceGraphActions(): WorkspaceGraphActions {
  const ctx = useContext(WorkspaceGraphContext);
  if (!ctx) {
    return { onToggleExpand: () => undefined };
  }
  return ctx;
}
