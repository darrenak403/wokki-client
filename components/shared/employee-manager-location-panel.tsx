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
import { useCreateLocationMutation, useLocationsQuery } from "@/hooks/useLocations";
import { useIsMobile } from "@/hooks/useMobile";
import {
  EMPLOYEE_CREATE_PAIR_HEIGHT_CLASS,
  WORKSPACE_PANEL_WIDTH_CLASS,
} from "@/components/shared/employee-create-dialog-pair-layout";
import { buildManagerLocationSelectionGraph } from "@/lib/workspace/manager-location-selection-graph";
import type { OrgFlowNode } from "@/lib/workspace/org-graph-types";
import { cn } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên chi nhánh").max(200),
  address: z.string().min(1, "Vui lòng nhập địa chỉ").max(500),
});

type WorkspaceMode = "select" | "create";

type EmployeeManagerLocationPanelProps = {
  embedded?: boolean;
  open?: boolean;
  selectedLocationIds: string[];
  onToggleLocation: (locationId: string) => void;
  onLocationCreated?: (locationId: string) => void;
};

export function EmployeeManagerLocationPanel({
  embedded = false,
  open = true,
  selectedLocationIds,
  onToggleLocation,
  onLocationCreated,
}: EmployeeManagerLocationPanelProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const { data: locations = [], isLoading } = useLocationsQuery();
  const createMutation = useCreateLocationMutation();
  const [mode, setMode] = useState<WorkspaceMode>("select");

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", address: "" },
  });

  const draftName = createForm.watch("name");
  const draftAddress = createForm.watch("address");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      createForm.reset({ name: "", address: "" });
      setMode("select");
    }
  }, [open, createForm]);

  const activeLocations = useMemo(
    () => locations.filter((location) => location.isActive),
    [locations]
  );

  useEffect(() => {
    if (!open || isLoading) return;
    setMode(activeLocations.length === 0 ? "create" : "select");
  }, [open, isLoading, activeLocations.length]);

  const graph = useMemo(
    () =>
      buildManagerLocationSelectionGraph(activeLocations, selectedLocationIds, {
        draftName: mode === "create" ? draftName : null,
        draftAddress: mode === "create" ? draftAddress : null,
      }),
    [activeLocations, selectedLocationIds, mode, draftName, draftAddress]
  );

  const selectedLabels = useMemo(
    () =>
      activeLocations
        .filter((location) => selectedLocationIds.includes(location.id))
        .map((location) => location.name),
    [activeLocations, selectedLocationIds]
  );

  const handleNodeSelect = (node: OrgFlowNode) => {
    if (node.data.kind !== "location" || node.data.isPreview || !node.data.locationId) return;
    onToggleLocation(node.data.locationId);
  };

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    const created = await createMutation.mutateAsync({
      name: values.name.trim(),
      address: values.address.trim(),
      timeZone: "Asia/Ho_Chi_Minh",
    });
    createForm.reset({ name: "", address: "" });
    if (onLocationCreated) {
      onLocationCreated(created.id);
    } else if (!selectedLocationIds.includes(created.id)) {
      onToggleLocation(created.id);
    }
    setMode("select");
  });

  if (!mounted || !open) return null;

  const panel = (
    <aside
      role="complementary"
      aria-labelledby="manager-location-title"
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
            id="manager-location-title"
            className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white"
          >
            Chọn chi nhánh quản lý
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            Bấm chi nhánh trên sơ đồ để gán quyền quản lý. Chưa có thì tạo nhanh bên dưới.
          </p>
        </header>

        <div className="mb-4 min-h-[240px] flex-1 overflow-hidden rounded-xl border bg-muted/20">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Đang tải chi nhánh…
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
            <div className="flex min-h-10 flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Đang chọn</span>
              {selectedLabels.length > 0 ? (
                selectedLabels.map((name) => (
                  <Badge key={name} variant="secondary" className="font-medium">
                    {name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm italic text-muted-foreground">Chưa chọn chi nhánh</span>
              )}
            </div>
            {activeLocations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeLocations.map((location) => {
                  const selected = selectedLocationIds.includes(location.id);
                  return (
                    <Button
                      key={location.id}
                      type="button"
                      size="sm"
                      variant={selected ? "default" : "outline"}
                      onClick={() => onToggleLocation(location.id)}
                    >
                      {location.name}
                    </Button>
                  );
                })}
              </div>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setMode("create")}
            >
              Tạo chi nhánh mới
            </Button>
          </div>
        ) : (
          <form
            onSubmit={onCreateSubmit}
            className="shrink-0 space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800"
          >
            <Field>
              <FieldLabel htmlFor="workspace-loc-name">Tên chi nhánh mới</FieldLabel>
              <Input
                id="workspace-loc-name"
                placeholder="VD: Wokki Cafe Quận 9"
                autoFocus
                {...createForm.register("name")}
              />
              <FieldError errors={[createForm.formState.errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="workspace-loc-address">Địa chỉ</FieldLabel>
              <Input
                id="workspace-loc-address"
                placeholder="VD: S901, Vinhome Grand Park"
                {...createForm.register("address")}
              />
              <FieldError errors={[createForm.formState.errors.address]} />
            </Field>
            <div className="flex gap-2">
              {activeLocations.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    createForm.reset({ name: "", address: "" });
                    setMode("select");
                  }}
                  disabled={createMutation.isPending}
                >
                  Quay lại chọn
                </Button>
              ) : null}
              <Button
                type="submit"
                className={activeLocations.length > 0 ? "flex-1" : "w-full"}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Đang tạo…" : "Tạo chi nhánh"}
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
