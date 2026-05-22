export const swapInboxKeys = {
  all: ["swapInbox"] as const,
  lists: () => [...swapInboxKeys.all, "list"] as const,
  list: (params: object) => [...swapInboxKeys.lists(), params] as const,
};

export const opsKeys = {
  all: ["ops"] as const,
  teamAttendance: (params: object) => [...opsKeys.all, "teamAttendance", params] as const,
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
};

export const foundationKeys = {
  all: ["foundation"] as const,
  locations: () => [...foundationKeys.all, "locations"] as const,
  departments: (locationId?: string | null) =>
    [...foundationKeys.all, "departments", { locationId: locationId ?? null }] as const,
  employees: (params: object) => [...foundationKeys.all, "employees", params] as const,
  employee: (id: string) => [...foundationKeys.all, "employee", id] as const,
  shifts: (params: { locationId: string; departmentId?: string | null }) =>
    [...foundationKeys.all, "shifts", params] as const,
  users: (params: object) => [...foundationKeys.all, "users", params] as const,
  user: (id: string) => [...foundationKeys.all, "user", id] as const,
};
