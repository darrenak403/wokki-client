export type LocationMembershipStatus = "Active" | "Pending" | "Rejected" | "Left" | "Transferred";

export interface LocationMembershipResponse {
  id: string;
  locationId: string;
  locationName: string;
  employeeId: string;
  employeeFirstName: string;
  employeeLastName: string;
  status: LocationMembershipStatus;
  requestedAt: string;
  reviewedById: string | null;
  reviewedAt: string | null;
  note: string | null;
}
