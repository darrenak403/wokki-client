"use client";

import { useLocationsQuery } from "@/lib/hooks/foundation/use-locations";
import { cn } from "@/lib/utils";

type LocationSelectProps = {
  value: string | null;
  onChange: (locationId: string | null) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
};

export function LocationSelect({
  value,
  onChange,
  className,
  required,
  disabled,
}: LocationSelectProps) {
  const { data: locations = [], isLoading } = useLocationsQuery();

  return (
    <select
      className={cn(
        "h-8 w-full max-w-sm rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
        className,
      )}
      value={value ?? ""}
      disabled={disabled || isLoading}
      required={required}
      onChange={(e) => onChange(e.target.value || null)}
      aria-label="Chọn chi nhánh"
    >
      <option value="">{isLoading ? "Đang tải…" : "Chọn chi nhánh"}</option>
      {locations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
          {!loc.isActive ? " (ngưng)" : ""}
        </option>
      ))}
    </select>
  );
}
