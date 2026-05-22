/** Role values from BE (`auth/me` and JWT claim). */
export const ROLE_ADMIN = "Admin";
export const ROLE_MANAGER = "Manager";
export const ROLE_USER = "User";

export type AppRole = typeof ROLE_ADMIN | typeof ROLE_MANAGER | typeof ROLE_USER;

/** Microsoft identity claim used in JWT payload. */
export const JWT_ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export const APP_ROLES = [ROLE_ADMIN, ROLE_MANAGER, ROLE_USER] as const;
