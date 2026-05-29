"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OrgGraph } from "@/app/(app)/[orgId]/admin/workspace/components/org-graph";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateDepartmentMutation, useDepartmentsQuery } from "@/hooks/useDepartments";
import { useIsMobile } from "@/hooks/useMobile";
import { buildDepartmentSelectionGraph } from "@/lib/workspace/department-selection-graph";
import type { OrgFlowNode } from "@/lib/workspace/org-graph-types";
import {
  EMPLOYEE_CREATE_PAIR_HEIGHT_CLASS,
  WORKSPACE_PANEL_WIDTH_CLASS,
} from "@/components/shared/employee-create-dialog-pair-layout";
import { cn } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên phòng ban").max(200),
});

type WorkspaceMode = "select" | "create";

type EmployeeDepartmentWorkspacePanelProps = {
  open: boolean;
  locationId: string | null;
  locationName: string;
  locationAddress?: string | null;
  selectedDepartmentId: string | null;
  onSelectDepartment: (departmentId: string) => void;
  onCreated: (departmentId: string) => void;
  /** Render inside pair shell (desktop) — no separate fixed portal. */
  embedded?: boolean;
};

export function EmployeeDepartmentWorkspacePanel({
  open,
  locationId,
  locationName,
  locationAddress,
  selectedDepartmentId,
  onSelectDepartment,
  onCreated,
  embedded = false,
}: EmployeeDepartmentWorkspacePanelProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const { data: departments = [], isLoading } = useDepartmentsQuery(locationId);
  const createMutation = useCreateDepartmentMutation(locationId);
  const [mode, setMode] = useState<WorkspaceMode>("select");

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "" },
  });

  const draftName = createForm.watch("name");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      createForm.reset({ name: "" });
      setMode("select");
    }
  }, [open, createForm]);

  useEffect(() => {
    if (!open || isLoading) return;
    setMode(departments.length === 0 ? "create" : "select");
  }, [open, isLoading, departments.length]);

  const selectedDepartment = useMemo(
    () => departments.find((dept) => dept.id === selectedDepartmentId) ?? null,
    [departments, selectedDepartmentId]
  );

  const graph = useMemo(() => {
    if (!locationId) return { nodes: [], edges: [] };
    return buildDepartmentSelectionGraph({
      locationId,
      locationName,
      locationAddress,
      departments,
      selectedDepartmentId,
      draftName: mode === "create" ? draftName : null,
    });
  }, [
    locationId,
    locationName,
    locationAddress,
    departments,
    selectedDepartmentId,
    mode,
    draftName,
  ]);

  const handleNodeSelect = (node: OrgFlowNode) => {
    if (node.data.kind !== "department" || node.data.isPreview || !node.data.departmentId) return;
    onSelectDepartment(node.data.departmentId);
    setMode("select");
  };

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    if (!locationId) return;
    const created = await createMutation.mutateAsync({
      locationId,
      name: values.name.trim(),
    });
    createForm.reset({ name: "" });
    onCreated(created.id);
    setMode("select");
  });

  if (!mounted || !open || !locationId) return null;

  const panel = (
    <aside
      role="complementary"
      aria-labelledby="dept-workspace-title"
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800",
        embedded
          ? cn(WORKSPACE_PANEL_WIDTH_CLASS, EMPLOYEE_CREATE_PAIR_HEIGHT_CLASS)
          : cn(
              "fixed z-[60] w-[min(480px,calc(100vw-2rem))] shrink-0",
              isMobile
                ? "inset-x-4 top-4 max-h-[min(420px,calc(100dvh-6rem))]"
                : EMPLOYEE_CREATE_PAIR_HEIGHT_CLASS
            ),
        !embedded && isMobile && "left-1/2 -translate-x-1/2"
      )}
    >
      <div className="flex h-full min-h-0 flex-col px-5 py-5 sm:px-6 sm:py-6">
        <header className="mb-3 shrink-0">
          <h3
            id="dept-workspace-title"
            className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white"
          >
            Chọn phòng ban
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            Bấm phòng ban trên sơ đồ thuộc chi nhánh{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-200">
              {locationName}
            </span>
            . Chưa có thì tạo nhanh bên dưới.
          </p>
        </header>

        <div className="mb-4 min-h-[240px] flex-1 overflow-hidden rounded-xl border bg-muted/20">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Đang tải sơ đồ…
            </div>
          ) : (
                <OrgGraph
                  nodes={graph.nodes}
                  edges={graph.edges}
                  onNodeSelect={handleNodeSelect}
                  onToggleExpand={() => {}}
                  showMiniMap={false}
                />
          )}
        </div>

        {mode === "select" ? (
          <div className="shrink-0 space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <div className="flex min-h-10 items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Đang chọn</span>
              {selectedDepartment ? (
                <Badge variant="secondary" className="max-w-[240px] truncate font-medium">
                  {selectedDepartment.name}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground italic">Chưa chọn phòng ban</span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setMode("create")}
            >
              Tạo phòng ban mới
            </Button>
          </div>
        ) : (
          <form
            onSubmit={onCreateSubmit}
            className="shrink-0 space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800"
          >
            <Field>
              <FieldLabel htmlFor="workspace-dept-name">Tên phòng ban mới</FieldLabel>
              <Input
                id="workspace-dept-name"
                placeholder="VD: Quầy bar, Pha chế…"
                autoFocus
                {...createForm.register("name")}
              />
              <FieldError errors={[createForm.formState.errors.name]} />
            </Field>
            <div className="flex gap-2">
              {departments.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    createForm.reset({ name: "" });
                    setMode("select");
                  }}
                  disabled={createMutation.isPending}
                >
                  Quay lại chọn
                </Button>
              ) : null}
              <Button
                type="submit"
                className={departments.length > 0 ? "flex-1" : "w-full"}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Đang tạo…" : "Tạo phòng ban"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </aside>
  );

  if (embedded) return panel;

  return createPortal(panel, document.body);
}
