"use client";

import { useEffect } from "react";
import { useDepartmentsQuery } from "@/lib/hooks/foundation/use-departments";
import { useLocationsQuery } from "@/lib/hooks/foundation/use-locations";
import {
  readFoundationSession,
  writeFoundationSession,
} from "@/lib/foundation/session-context";

/**
 * Validates persisted session against live lists (Wave 2 Phase 05).
 * Clears stale location/department ids after F5 or BE changes.
 */
export function FoundationSessionValidator() {
  const { data: locations } = useLocationsQuery();
  const session = readFoundationSession();
  const { data: departments } = useDepartmentsQuery(session.selectedLocationId);

  useEffect(() => {
    if (!locations) return;
    const current = readFoundationSession();
    let patch: Partial<typeof current> | null = null;

    if (
      current.selectedLocationId &&
      !locations.some((l) => l.id === current.selectedLocationId)
    ) {
      patch = {
        selectedLocationId: null,
        selectedDepartmentId: null,
        shiftDefinitionIds: [],
      };
    }

    if (patch) {
      writeFoundationSession(patch);
      return;
    }

    if (!departments || !current.selectedDepartmentId) return;

    if (!departments.some((d) => d.id === current.selectedDepartmentId)) {
      writeFoundationSession({ selectedDepartmentId: null });
    }
  }, [locations, departments]);

  return null;
}
