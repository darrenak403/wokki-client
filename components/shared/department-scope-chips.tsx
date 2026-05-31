"use client";

import { useMemo } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useDepartmentsQuery } from "@/hooks/useDepartments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DepartmentResponse } from "@/types/foundation";

type DepartmentScopeChipsProps = {
  locationId: string | null;
  value: string | null;
  onChange: (departmentId: string | null) => void;
  /** Show "Tất cả" chip — page filters. Default true. */
  allowAll?: boolean;
  /** Max department chips before "+N" overflow. Default 4. */
  maxVisible?: number;
  showLabel?: boolean;
  className?: string;
  disabled?: boolean;
};

function partitionDepartments(
  departments: DepartmentResponse[],
  selectedId: string | null,
  maxVisible: number
): { visible: DepartmentResponse[]; overflow: DepartmentResponse[] } {
  if (departments.length <= maxVisible) {
    return { visible: departments, overflow: [] };
  }

  const selected = selectedId ? departments.find((d) => d.id === selectedId) : null;
  const base = departments.slice(0, maxVisible);
  const visibleIds = new Set(base.map((d) => d.id));

  if (selected && !visibleIds.has(selected.id)) {
    const next = [...base];
    next[next.length - 1] = selected;
    const ids = new Set(next.map((d) => d.id));
    return {
      visible: next,
      overflow: departments.filter((d) => !ids.has(d.id)),
    };
  }

  return {
    visible: base,
    overflow: departments.filter((d) => !visibleIds.has(d.id)),
  };
}

function DepartmentChip({
  label,
  active,
  inactive,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  inactive?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C88C6]/50 focus-visible:ring-offset-1",
        active
          ? "border-[#1D4D8F] bg-[#1D4D8F] text-white shadow-sm"
          : inactive
            ? "border-dashed border-neutral-300 bg-neutral-50 text-neutral-500 dark:border-neutral-600 dark:bg-neutral-900/50 dark:text-neutral-400"
            : "border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
        className
      )}
    >
      {label}
    </button>
  );
}

export function DepartmentScopeChips({
  locationId,
  value,
  onChange,
  allowAll = true,
  maxVisible = 4,
  showLabel = true,
  className,
  disabled,
}: DepartmentScopeChipsProps) {
  const { data: departments = [], isLoading } = useDepartmentsQuery(locationId);
  const isDisabled = disabled || !locationId || isLoading;

  const { visible, overflow } = useMemo(
    () => partitionDepartments(departments, value, maxVisible),
    [departments, value, maxVisible]
  );

  const overflowSelected = value != null && overflow.some((d) => d.id === value);

  if (!locationId) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>Chọn chi nhánh trước.</p>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {showLabel ? (
          <span className="shrink-0 text-sm font-medium text-muted-foreground">Phòng ban:</span>
        ) : null}
        <span className="text-sm text-muted-foreground">Đang tải…</span>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {showLabel ? (
          <span className="shrink-0 text-sm font-medium text-muted-foreground">Phòng ban:</span>
        ) : null}
        <span className="text-sm text-muted-foreground">Chưa có phòng ban trong chi nhánh này.</span>
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2", className)}>
      {showLabel ? (
        <span className="shrink-0 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Phòng ban:
        </span>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {allowAll ? (
          <DepartmentChip
            label="Tất cả"
            active={value == null}
            onClick={() => onChange(null)}
            className={isDisabled ? "pointer-events-none opacity-50" : undefined}
          />
        ) : null}

        {visible.map((dept) => (
          <DepartmentChip
            key={dept.id}
            label={dept.isActive ? dept.name : `${dept.name} (Ngưng)`}
            active={value === dept.id}
            inactive={!dept.isActive}
            onClick={() => onChange(dept.id)}
            className={isDisabled ? "pointer-events-none opacity-50" : undefined}
          />
        ))}

        {overflow.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={isDisabled}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C88C6]/50 focus-visible:ring-offset-1",
                overflowSelected
                  ? "border-[#1D4D8F] bg-[#1D4D8F] text-white"
                  : "border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              )}
            >
              +{overflow.length}
              <ChevronDownIcon className="size-3.5 opacity-70" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              {overflow.map((dept) => (
                <DropdownMenuItem
                  key={dept.id}
                  onClick={() => onChange(dept.id)}
                  className={value === dept.id ? "bg-accent" : undefined}
                >
                  {dept.name}
                  {!dept.isActive ? " (Ngưng)" : ""}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}
