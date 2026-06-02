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
  daysUntilExpiry: number | null;
  isExpiringSoon: boolean;
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

export type PlatformOrganizationSortBy = "createdAt" | "name" | "expiryDate";
export type PlatformSortDirection = "asc" | "desc";

export interface PlatformOrganizationListParams extends PlatformListParams {
  status?: SubscriptionStatus;
  sortBy?: PlatformOrganizationSortBy;
  sortDirection?: PlatformSortDirection;
  expiringWithinDays?: number;
}

export interface PlatformSubscriptionLedgerListParams {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  action?: string;
  from?: string;
  to?: string;
}

export interface PlatformSubscriptionLedgerEntryResponse {
  id: string;
  organizationId: string;
  action: string;
  previousStatus: SubscriptionStatus | string;
  newStatus: SubscriptionStatus | string;
  previousDurationDays: number;
  newDurationDays: number;
  previousExpiresAt: string | null;
  newExpiresAt: string | null;
  changedByUserId: string;
  changedAt: string;
}

export interface PlatformSupportSearchParams {
  page?: number;
  pageSize?: number;
  query?: string;
}

export interface PlatformSupportSearchResponse {
  matchType: string;
  organizationId: string;
  organizationName: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: string | null;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  userName: string | null;
  userCount: number;
  locationCount: number;
  employeeCount: number;
  latestOperationalActivityAt: string | null;
}

export interface PlatformSupportLatestLedgerResponse {
  id: string;
  action: string;
  previousStatus: SubscriptionStatus | string;
  newStatus: SubscriptionStatus | string;
  changedAt: string;
  changedByUserId: string;
}

export interface PlatformOrganizationSupportContextResponse {
  organizationId: string;
  organizationName: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionDurationDays: number;
  subscriptionActivatedAt: string | null;
  subscriptionExpiresAt: string | null;
  subscriptionUpdatedAt: string | null;
  organizationCreatedAt: string;
  userCount: number;
  employeeCount: number;
  locationCount: number;
  departmentCount: number;
  latestScheduleCreatedAt: string | null;
  latestSchedulePublishedAt: string | null;
  latestAttendanceClockIn: string | null;
  latestChatMessageAt: string | null;
  latestOperationalActivityAt: string | null;
  latestSubscriptionLedgerEntry: PlatformSupportLatestLedgerResponse | null;
}

export interface PlatformDiagnosticFailureResponse {
  lastFailureAtUtc: string | null;
  lastFailureCode: string | null;
  lastFailureMessage: string | null;
}

export interface PlatformDiagnosticComponentResponse {
  name: string;
  status: string;
  checkedAtUtc: string;
  lastFailure: PlatformDiagnosticFailureResponse;
}

export interface PlatformHealthResponse {
  status: string;
  checkedAtUtc: string;
  components: PlatformDiagnosticComponentResponse[];
}

export interface PlatformUsageAnalyticsParams {
  windowDays?: 7 | 30;
  organizationId?: string;
}

export interface PlatformUsageOrgActivityResponse {
  organizationId: string;
  organizationName: string;
  lastActivityAt: string;
  activityCount: number;
}

export interface PlatformUsageEventTypeCountResponse {
  eventType: string;
  count: number;
}

export interface PlatformUsageWeeklyActiveResponse {
  weekStartDate: string;
  activeOrgCount: number;
}

export interface PlatformUsageAnalyticsResponse {
  windowDays: number;
  fromUtc: string;
  toUtc: string;
  activeOrganizationCount: number;
  activeOrganizations: PlatformUsageOrgActivityResponse[];
  countsByEventType: PlatformUsageEventTypeCountResponse[];
  weeklyActiveOrganizations: PlatformUsageWeeklyActiveResponse[];
  topOrganizations: PlatformUsageOrgActivityResponse[];
}
