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
}
