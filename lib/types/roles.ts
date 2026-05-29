/** Role values from BE (JWT claim; profile API sau Wave profile). */
export const ROLE_ADMIN = "Admin";
export const ROLE_MANAGER = "Manager";
export const ROLE_USER = "User";
export const ROLE_PLATFORM_OPERATOR = "PlatformOperator";

export type AppRole = typeof ROLE_ADMIN | typeof ROLE_MANAGER | typeof ROLE_USER;
export type SessionRole = AppRole | typeof ROLE_PLATFORM_OPERATOR;

/** Microsoft identity claim used in JWT payload. */
export const JWT_ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export const APP_ROLES = [ROLE_ADMIN, ROLE_MANAGER, ROLE_USER] as const;
export const ORG_APP_ROLES = APP_ROLES;
export const PLATFORM_ROLES = [ROLE_PLATFORM_OPERATOR] as const;

export function isAppRole(role: SessionRole | null | undefined): role is AppRole {
  return role != null && APP_ROLES.includes(role as AppRole);
}

export function isPlatformOperator(
  role: SessionRole | null | undefined
): role is typeof ROLE_PLATFORM_OPERATOR {
  return role === ROLE_PLATFORM_OPERATOR;
}
