import { readFoundationSession } from "@/lib/foundation/session-context";
import type { FoundationState } from "@/types/foundation";

/**
 * Snapshot for Wave 3 schedule — reads sessionStorage context.
 * Requires caller to ensure location/department ids are set.
 */
export function getFoundationState(): Partial<FoundationState> {
  const session = readFoundationSession();
  return {
    locationId: session.selectedLocationId ?? undefined,
    departmentId: session.selectedDepartmentId ?? undefined,
    shiftDefinitionIds: session.shiftDefinitionIds,
  };
}
