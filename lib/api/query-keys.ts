export const overtimeKeys = {
  all: ["overtime"] as const,
  my: (params?: object) => [...overtimeKeys.all, "my", params] as const,
  pending: (params?: object) => [...overtimeKeys.all, "pending", params] as const,
  adminList: (params?: object) => [...overtimeKeys.all, "admin-list", params] as const,
};

export const swapInboxKeys = {
  all: ["swapInbox"] as const,
  lists: () => [...swapInboxKeys.all, "list"] as const,
  list: (params: object) => [...swapInboxKeys.lists(), params] as const,
};

export const opsKeys = {
  all: ["ops"] as const,
  teamAttendance: (params: object) => [...opsKeys.all, "teamAttendance", params] as const,
};

export const chatKeys = {
  all: ["chat"] as const,
  channels: () => [...chatKeys.all, "channels"] as const,
  messages: (channelId: string) => [...chatKeys.all, "messages", channelId] as const,
};

export const payrollKeys = {
  all: ["payroll"] as const,
  summary: (params: object) => [...payrollKeys.all, "summary", params] as const,
  employeeDetail: (employeeId: string, params: object) =>
    [...payrollKeys.all, "detail", employeeId, params] as const,
};

export const employeeKeys = {
  all: ["employee"] as const,
  mySchedule: () => [...employeeKeys.all, "mySchedule"] as const,
  swapTargets: (params: object) => [...employeeKeys.all, "swapTargets", params] as const,
  swaps: () => [...employeeKeys.all, "swaps"] as const,
  attendance: (params: object) => [...employeeKeys.all, "attendance", params] as const,
};

export const scheduleKeys = {
  all: ["schedule"] as const,
  lists: () => [...scheduleKeys.all, "list"] as const,
  list: (params: { departmentId: string; weekStartDate: string }) =>
    [...scheduleKeys.lists(), params] as const,
  details: () => [...scheduleKeys.all, "detail"] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  preferenceBoard: (scheduleId: string) =>
    [...scheduleKeys.all, "preferenceBoard", scheduleId] as const,
  insightContext: (scheduleId: string) =>
    [...scheduleKeys.all, "insightContext", scheduleId] as const,
};

export const statsKeys = {
  all: ["stats"] as const,
  org: () => [...statsKeys.all, "org"] as const,
  platform: () => [...statsKeys.all, "platform"] as const,
  subscription: () => [...statsKeys.all, "subscription"] as const,
};

export const platformKeys = {
  all: ["platform"] as const,
  users: (params: object) => [...platformKeys.all, "users", params] as const,
  organizations: (params: object) => [...platformKeys.all, "organizations", params] as const,
};

export const preferenceKeys = {
  all: ["schedulePreference"] as const,
  draft: (weekStartDate: string) => [...preferenceKeys.all, "draft", weekStartDate] as const,
  mine: (scheduleId: string) => [...preferenceKeys.all, "mine", scheduleId] as const,
};

export const bedrockKeys = {
  all: ["bedrock"] as const,
  health: () => [...bedrockKeys.all, "health"] as const,
};

export const membershipKeys = {
  all: ["membership"] as const,
  my: () => [...membershipKeys.all, "my"] as const,
  pending: () => [...membershipKeys.all, "pending"] as const,
  byLocation: (locationId: string, status?: string | null) =>
    [...membershipKeys.all, "location", locationId, { status: status ?? null }] as const,
};

export const managerKeys = {
  all: ["locationManagers"] as const,
  byLocation: (locationId: string) => [...managerKeys.all, "location", locationId] as const,
  myLocations: () => [...managerKeys.all, "myLocations"] as const,
};

export const foundationKeys = {
  all: ["foundation"] as const,
  locations: () => [...foundationKeys.all, "locations"] as const,
  locationPolicy: (locationId: string) =>
    [...foundationKeys.all, "locationPolicy", locationId] as const,
  departments: (locationId?: string | null) =>
    [...foundationKeys.all, "departments", { locationId: locationId ?? null }] as const,
  employees: (params: object) => [...foundationKeys.all, "employees", params] as const,
  employee: (id: string) => [...foundationKeys.all, "employee", id] as const,
  shifts: (params: { locationId: string; departmentId?: string | null }) =>
    [...foundationKeys.all, "shifts", params] as const,
  users: (params: object) => [...foundationKeys.all, "users", params] as const,
  user: (id: string) => [...foundationKeys.all, "user", id] as const,
};
