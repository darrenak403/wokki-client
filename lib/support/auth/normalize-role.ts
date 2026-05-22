import {
  APP_ROLES,
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_USER,
  type AppRole,
} from "@/lib/types/roles";

const ROLE_ALIASES: Record<string, AppRole> = {
  admin: ROLE_ADMIN,
  Admin: ROLE_ADMIN,
  ADMIN: ROLE_ADMIN,
  ROLE_ADMIN: ROLE_ADMIN,

  manager: ROLE_MANAGER,
  Manager: ROLE_MANAGER,
  MANAGER: ROLE_MANAGER,
  ROLE_MANAGER: ROLE_MANAGER,

  user: ROLE_USER,
  User: ROLE_USER,
  USER: ROLE_USER,
  ROLE_USER: ROLE_USER,
  employee: ROLE_USER,
  Employee: ROLE_USER,
};

const ROLE_BY_NUMBER: Record<number, AppRole> = {
  0: ROLE_ADMIN,
  1: ROLE_MANAGER,
  2: ROLE_USER,
};

/** Chuẩn hóa role từ BE / JWT / persist → `Admin` | `Manager` | `User`. */
export function normalizeAppRole(value: unknown): AppRole | null {
  if (value == null) return null;

  if (typeof value === "number" && Number.isInteger(value)) {
    return ROLE_BY_NUMBER[value] ?? null;
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (APP_ROLES.includes(trimmed as AppRole)) {
    return trimmed as AppRole;
  }

  const alias = ROLE_ALIASES[trimmed];
  if (alias) return alias;

  const lower = trimmed.toLowerCase();
  const fromCase = APP_ROLES.find((r) => r.toLowerCase() === lower);
  return fromCase ?? ROLE_ALIASES[lower] ?? null;
}
