"use client";

import { usePathname } from "next/navigation";
import { MapPinIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { useWorkspaceLocations } from "@/hooks/useWorkspaceLocations";
import { useTenantParams } from "@/hooks/useTenantParams";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import { writeFoundationSession } from "@/lib/support/foundation/session-context";
import { ROLE_MANAGER } from "@/lib/types/roles";
import { useAuth } from "@/hooks/useAuth";
import { DepartmentScopeChips } from "@/components/shared/department-scope-chips";

type FoundationScopePickerProps = {
  /** Branch comes from URL — only show department select. */
  hideLocationSelect?: boolean;
};

export function FoundationScopePicker({ hideLocationSelect = false }: FoundationScopePickerProps) {
  const pathname = usePathname();
  const { role } = useAuth();
  const { session } = useFoundationSession();
  const { switchBranch } = useTenantNavigation();
  const { locationId: urlLocationId } = useTenantParams();
  const isManagerScope = role === ROLE_MANAGER;
  const { data: locations = [] } = useWorkspaceLocations(isManagerScope);

  const effectiveLocationId = hideLocationSelect
    ? urlLocationId ?? session.selectedLocationId
    : session.selectedLocationId;

  const locationItems = locations.map((loc) => ({
    value: loc.id,
    label: `${loc.name}${!loc.isActive ? " (ngưng)" : ""}`,
  }));

  const isWorkspaceRoute = pathname.includes("/workspace");

  if (isWorkspaceRoute) return null;

  if (!hideLocationSelect && locations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có chi nhánh — vào mục Tổ chức để thiết lập.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!hideLocationSelect ? (
        <>
          <MapPinIcon className="size-4 shrink-0 text-[#4C88C6]" aria-hidden />
          <Select
            value={session.selectedLocationId ?? ""}
            onValueChange={(nextLocationId) => {
              if (!nextLocationId) return;
              switchBranch(nextLocationId);
            }}
            items={locationItems}
          >
            <SelectTrigger className="w-[min(100%,220px)]" aria-label="Chọn chi nhánh">
              <SelectValue placeholder="Chọn chi nhánh">
                {(value) => locationItems.find((item) => item.value === value)?.label ?? null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                  {!loc.isActive ? " (ngưng)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      ) : null}

      <DepartmentScopeChips
        locationId={effectiveLocationId ?? null}
        value={session.selectedDepartmentId}
        onChange={(departmentId) => {
          if (!effectiveLocationId) return;
          writeFoundationSession({
            selectedLocationId: effectiveLocationId,
            selectedDepartmentId: departmentId,
          });
        }}
        allowAll
        maxVisible={5}
        className="w-full"
      />
    </div>
  );
}
