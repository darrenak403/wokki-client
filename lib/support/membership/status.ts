import type { LocationMembershipStatus } from "@/types/location-membership";

/** BE may serialize enums as string names or numeric values (Active = 1). */
export function normalizeMembershipStatus(status: unknown): LocationMembershipStatus {
  if (status === "Active" || status === 1) return "Active";
  if (status === "Pending" || status === 0) return "Pending";
  if (status === "Rejected" || status === 2) return "Rejected";
  if (status === "Left" || status === 3) return "Left";
  if (status === "Transferred" || status === 4) return "Transferred";
  return "Pending";
}

export function isActiveMembershipStatus(status: unknown): boolean {
  return normalizeMembershipStatus(status) === "Active";
}
