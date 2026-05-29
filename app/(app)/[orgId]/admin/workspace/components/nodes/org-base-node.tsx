"use client";

import { Handle, Position } from "@xyflow/react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useWorkspaceGraphActions } from "@/app/(app)/[orgId]/admin/workspace/components/workspace-graph-context";
import { cn } from "@/lib/utils";
import type { OrgNodeData, OrgNodeKind } from "@/lib/workspace/org-graph-types";

type OrgBaseNodeProps = {
  data: OrgNodeData;
  tone?: "location" | "department" | "manager" | "employee" | "pending";
  nodeId?: string;
  nodeType?: OrgNodeKind;
};

const toneClasses: Record<NonNullable<OrgBaseNodeProps["tone"]>, string> = {
  location: "border-[#4C88C6]/50 bg-[#EEF6FB] dark:bg-[#0B1E3D]",
  department: "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900",
  manager: "border-amber-300/60 bg-amber-50 dark:bg-amber-950/30",
  employee: "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/80",
  pending: "border-orange-300/70 bg-orange-50 dark:bg-orange-950/20",
};

const dropTargetClass =
  "ring-2 ring-[#4C88C6] ring-offset-2 border-[#4C88C6] dark:ring-[#BCE8F5]";

export function OrgBaseNode({ data, tone = "location", nodeId, nodeType }: OrgBaseNodeProps) {
  const { onToggleExpand } = useWorkspaceGraphActions();
  return (
    <div
      className={cn(
        "min-w-[180px] max-w-[220px] rounded-lg border px-3 py-2 shadow-sm text-left transition-shadow",
        toneClasses[tone],
        !data.isActive && data.kind !== "pendingMembership" && "opacity-60",
        data.isDraggable && "cursor-grab active:cursor-grabbing",
        data.isDropTarget && dropTargetClass,
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-neutral-400" />
      <div className="flex items-start gap-1">
        {data.canExpand ? (
          <button
            type="button"
            className="mt-0.5 shrink-0 rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label={data.isExpanded ? "Thu gọn" : "Mở rộng"}
            onClick={(e) => {
              e.stopPropagation();
              if (nodeId && nodeType) {
                onToggleExpand({
                  id: nodeId,
                  type: nodeType,
                  position: { x: 0, y: 0 },
                  data,
                });
              }
            }}
          >
            {data.isExpanded ? (
              <ChevronDownIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            )}
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{data.label}</p>
          {data.subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{data.subtitle}</p>
          ) : null}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-neutral-400" />
    </div>
  );
}
