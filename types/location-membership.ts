export type LocationMembershipStatus = "Active" | "Pending" | "Rejected" | "Left" | "Transferred";

export type ReviewMembershipStatus = Extract<LocationMembershipStatus, "Active" | "Rejected">;

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

export interface ReviewMembershipRequest {
  status: ReviewMembershipStatus;
  note?: string | null;
}

export interface TransferLocationRequest {
  employeeId: string;
  toLocationId: string;
}

export interface TransferDepartmentRequest {
  employeeId: string;
  toDepartmentId: string;
}

export interface TransferDepartmentResponse {
  employeeId: string;
  toDepartmentId: string;
}

export interface AssignLocationManagerRequest {
  userId: string;
}

export interface LocationManagerResponse {
  id: string;
  locationId: string;
  locationName: string;
  userId: string;
  userEmail: string;
  assignedById: string;
  assignedAt: string;
  /** Linked Employee row — required for role-transition demote from org graph. */
  employeeId?: string | null;
}
