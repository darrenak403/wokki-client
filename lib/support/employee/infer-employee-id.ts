import type { ShiftAssignmentResponse } from "@/types/schedule";
import type { SwapRequestResponse } from "@/types/employee";

/** Resolve logged-in employee id when schedule list is empty but swaps exist. */
export function inferMyEmployeeId(
  assignments: ShiftAssignmentResponse[],
  swaps: SwapRequestResponse[],
): string | null {
  const fromSchedule = assignments[0]?.employeeId;
  if (fromSchedule) return fromSchedule;
  if (swaps.length === 0) return null;

  const candidateIds = new Set<string>();
  for (const s of swaps) {
    candidateIds.add(s.requesterId);
    candidateIds.add(s.targetEmployeeId);
  }

  for (const id of candidateIds) {
    const onEverySwap = swaps.every(
      (s) => s.requesterId === id || s.targetEmployeeId === id,
    );
    if (onEverySwap) return id;
  }

  return swaps[0]?.requesterId ?? swaps[0]?.targetEmployeeId ?? null;
}
