"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, Building2Icon } from "lucide-react";
import { useDepartmentsQuery } from "@/hooks/useDepartments";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [open, setOpen] = useState(false);
  const { data: departments = [], isLoading } = useDepartmentsQuery(locationId);
  const selectedLabel = useMemo(() => {
    if (!value) return null;
    return departments.find((dept) => dept.id === value)?.name ?? null;
  }, [departments, value]);
  const isDisabled = disabled || !locationId || isLoading;
  const triggerLabel = !locationId
    ? "Chọn chi nhánh trước"
    : isLoading
      ? "Đang tải phòng ban..."
      : selectedLabel ?? (allowEmpty ? "Tất cả phòng ban" : "Chọn phòng ban");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "h-8 w-full max-w-sm rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
          "inline-flex items-center justify-between gap-2 text-left",
          className,
        )}
        aria-label="Chọn phòng ban"
        disabled={isDisabled}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <Building2Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{triggerLabel}</span>
        </span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-[min(92vw,320px)] p-1.5">
        <Command>
          <CommandInput placeholder="Tìm phòng ban..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy phòng ban.</CommandEmpty>
            <CommandGroup heading="Phòng ban">
              {allowEmpty ? (
                <CommandItem
                  value="all-departments"
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">Tất cả phòng ban</span>
                  {!value ? <CheckIcon className="ml-auto size-4" /> : null}
                </CommandItem>
              ) : null}
              {departments.map((dept) => (
                <CommandItem
                  key={dept.id}
                  value={`${dept.name} ${dept.id}`}
                  onSelect={() => {
                    onChange(dept.id);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">
                    {dept.name}
                    {!dept.isActive ? " (ngưng)" : ""}
                  </span>
                  {value === dept.id ? <CheckIcon className="ml-auto size-4" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
