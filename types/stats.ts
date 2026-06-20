export interface PlatformStatsResponse {
  organizationCount: number;
  userCount: number;
  locationCount: number;
  employeeCount: number;
}

export interface OrgStatsResponse {
  organizationId: string;
  userCount: number;
  locationCount: number;
  departmentCount: number;
  employeeCount: number;
  activeLocationMembershipCount: number;
  subscriptionStatus: OrgSubscriptionStatus;
  subscriptionDurationDays: number;
  subscriptionExpiresAt: string | null;
  daysRemaining: number | null;
}

export type OrgSubscriptionStatus = "NotActivated" | "Active" | "Expired" | "Disabled";

export interface OrgSubscriptionResponse {
  organizationId: string;
  subscriptionStatus: OrgSubscriptionStatus;
  /** Admin-chosen package length (days) from last activation/renewal. */
  subscriptionDurationDays: number;
  subscriptionExpiresAt: string | null;
  daysRemaining: number | null;
}

export interface OrgUsageAnalyticsEventTypeCountResponse {
  eventType: string;
  count: number;
}

export interface OrgUsageAnalyticsDailyCountResponse {
  date: string;
  eventType: string;
  count: number;
}

export interface OrgUsageAnalyticsResponse {
  windowDays: number;
  fromUtc: string;
  toUtc: string;
  totalActivityCount: number;
  countsByEventType: OrgUsageAnalyticsEventTypeCountResponse[];
  dailyCounts: OrgUsageAnalyticsDailyCountResponse[];
}

export interface OrgUsageAnalyticsParams {
  windowDays?: 7 | 30;
}
