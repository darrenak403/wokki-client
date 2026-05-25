"use client";

import { MapPinIcon } from "lucide-react";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { useDepartmentsQuery } from "@/hooks/useDepartments";
import { useLocationsQuery } from "@/hooks/useLocations";

export function FoundationBreadcrumb() {
  const { session } = useFoundationSession();
  const { data: locations = [] } = useLocationsQuery();
  const { data: departments = [] } = useDepartmentsQuery(session.selectedLocationId);

  const location = locations.find((l) => l.id === session.selectedLocationId);
  const department = departments.find((d) => d.id === session.selectedDepartmentId);

  if (!location) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
      <MapPinIcon className="size-3.5 shrink-0 text-[#4C88C6]" />
      <span className="font-medium text-neutral-700 dark:text-neutral-300">{location.name}</span>
      {department && (
        <>
          <span className="text-neutral-300 dark:text-neutral-600">—</span>
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {department.name}
          </span>
        </>
      )}
    </div>
  );
}
