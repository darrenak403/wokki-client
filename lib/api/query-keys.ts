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
