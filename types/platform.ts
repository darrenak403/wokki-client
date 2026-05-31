export type SubscriptionStatus = "NotActivated" | "Active" | "Expired" | "Disabled";

export interface PlatformUserResponse {
  id: string;
  email: string;
  role: "PlatformOperator" | "Admin" | "Manager" | "User";
  organizationId: string | null;
  organizationName: string | null;
  createdAt: string;
}

export interface PlatformOrganizationResponse {
  id: string;
  name: string;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEnabled: boolean;
  subscriptionDurationDays: number;
  subscriptionActivatedAt: string | null;
  subscriptionExpiresAt: string | null;
  subscriptionUpdatedAt: string | null;
  createdAt: string;
  userCount: number;
  locationCount: number;
  employeeCount: number;
}

export interface UpdateOrganizationSubscriptionRequest {
  enabled: boolean;
  durationDays?: number | null;
}

export interface PlatformListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  organizationId?: string;
  role?: string;
}
