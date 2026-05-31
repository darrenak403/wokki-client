import {
  APP_ROLES,
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_PLATFORM_OPERATOR,
  ROLE_USER,
  type AppRole,
  type SessionRole,
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

const SESSION_ROLE_ALIASES: Record<string, SessionRole> = {
  ...ROLE_ALIASES,
  platformoperator: ROLE_PLATFORM_OPERATOR,
  PlatformOperator: ROLE_PLATFORM_OPERATOR,
  PLATFORM_OPERATOR: ROLE_PLATFORM_OPERATOR,
};

const ROLE_BY_NUMBER: Record<number, AppRole> = {
  0: ROLE_ADMIN,
  1: ROLE_MANAGER,
  2: ROLE_USER,
};

/** Chuẩn hóa role org app từ BE / JWT → `Admin` | `Manager` | `User`. */
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

/** Chuẩn hóa role session — gồm `PlatformOperator`. */
export function normalizeSessionRole(value: unknown): SessionRole | null {
  const appRole = normalizeAppRole(value);
  if (appRole) return appRole;

  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed === ROLE_PLATFORM_OPERATOR) return ROLE_PLATFORM_OPERATOR;

  const alias = SESSION_ROLE_ALIASES[trimmed] ?? SESSION_ROLE_ALIASES[trimmed.toLowerCase()];
  return alias ?? null;
}
