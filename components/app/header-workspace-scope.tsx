"use client";

import { Building2Icon, MapPinIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDepartmentsQuery } from "@/hooks/useDepartments";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { useMyProfileQuery } from "@/hooks/useMyProfile";
import { useTenantParams } from "@/hooks/useTenantParams";
import { useWorkspaceLocations } from "@/hooks/useWorkspaceLocations";
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";
import { cn } from "@/lib/utils";

type HeaderWorkspaceScopeProps = {
  className?: string;
};

export function HeaderWorkspaceScope({ className }: HeaderWorkspaceScopeProps) {
  const { role } = useAuth();
  const { session } = useFoundationSession();
  const { locationId: urlLocationId } = useTenantParams();
  const isManagerScope = role === ROLE_MANAGER;
  const isEmployee = role === ROLE_USER;
  const isOrgAdmin = role === ROLE_ADMIN;

  const { data: profile } = useMyProfileQuery({
    enabled: !isOrgAdmin && (isEmployee || isManagerScope),
  });
  const { data: locations = [] } = useWorkspaceLocations(isManagerScope);
  const effectiveLocationId = urlLocationId ?? session.selectedLocationId ?? profile?.locationId ?? null;
  const departmentId = session.selectedDepartmentId ?? profile?.departmentId ?? null;
  const { data: departments = [] } = useDepartmentsQuery(isOrgAdmin ? null : effectiveLocationId);

  if (isOrgAdmin) {
    return (
      <p
        className={cn(
          "flex min-w-0 items-center gap-2 overflow-hidden text-sm text-neutral-500 dark:text-neutral-400",
          className,
        )}
      >
        <MapPinIcon className="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
        <span className="truncate">Quản trị viên · Toàn chi nhánh</span>
      </p>
    );
  }

  const locationName =
    locations.find((location) => location.id === effectiveLocationId)?.name ??
    profile?.locationName ??
    null;
  const departmentName =
    departments.find((department) => department.id === departmentId)?.name ??
    profile?.departmentName ??
    null;

  if (!locationName && !departmentName) return null;

  return (
    <p
      className={cn(
        "flex min-w-0 items-center gap-2 overflow-hidden text-sm text-neutral-500 dark:text-neutral-400",
        className
      )}
    >
      {locationName ? (
        <span className="inline-flex min-w-0 max-w-[min(100%,14rem)] shrink items-center gap-1">
          <MapPinIcon className="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
          <span className="truncate">{locationName}</span>
        </span>
      ) : null}
      {locationName && departmentName ? (
        <span className="shrink-0 text-neutral-300 dark:text-neutral-600" aria-hidden="true">
          ·
        </span>
      ) : null}
      {departmentName ? (
        <span className="inline-flex min-w-0 max-w-[min(100%,10rem)] shrink items-center gap-1">
          <Building2Icon className="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
          <span className="truncate">{departmentName}</span>
        </span>
      ) : null}
    </p>
  );
}
