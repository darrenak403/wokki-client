export type OrgJoinRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Expired"
  | "Cancelled";

export interface OrganizationDirectoryItem {
  id: string;
  name: string;
}

export interface OrgJoinRequestResponse {
  id: string;
  organizationId: string;
  organizationName: string;
  status: OrgJoinRequestStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  rejectNote?: string | null;
}

export interface PendingOrgJoinRequestResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  submittedAt: string;
}

export interface SubmitOrgJoinRequest {
  organizationId: string;
}

export interface ApproveOrgJoinRequest {
  departmentId: string;
  hourlyRate: number;
  phone?: string | null;
}

export interface RejectOrgJoinRequest {
  note?: string | null;
}
