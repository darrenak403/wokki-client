"use client";

import { useDepartmentsQuery } from "@/lib/hooks/foundation/use-departments";
import { cn } from "@/lib/utils";

type DepartmentSelectProps = {
  locationId: string | null;
  value: string | null;
  onChange: (departmentId: string | null) => void;
  className?: string;
  allowEmpty?: boolean;
  disabled?: boolean;
};

export function DepartmentSelect({
  locationId,
  value,
  onChange,
  className,
  allowEmpty = true,
  disabled,
}: DepartmentSelectProps) {
  const { data: departments = [], isLoading } = useDepartmentsQuery(locationId);

  return (
    <select
      className={cn(
        "h-8 w-full max-w-sm rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
        className,
      )}
      value={value ?? ""}
      disabled={disabled || !locationId || isLoading}
      onChange={(e) => onChange(e.target.value || null)}
      aria-label="Chọn phòng ban"
    >
      {allowEmpty ? (
        <option value="">
          {!locationId
            ? "Chọn chi nhánh trước"
            : isLoading
              ? "Đang tải…"
              : "Tất cả phòng ban"}
        </option>
      ) : null}
      {departments.map((dept) => (
        <option key={dept.id} value={dept.id}>
          {dept.name}
          {!dept.isActive ? " (ngưng)" : ""}
        </option>
      ))}
    </select>
  );
}
