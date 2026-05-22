import { getRolesFromToken } from "@/lib/support/auth/jwt-roles";
import { resolveRoleFromRoles } from "@/lib/support/auth/app-routes";
import { normalizeAppRole } from "@/lib/support/auth/normalize-role";
import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/support/auth/session-cookies";
import type { AppRole } from "@/lib/types/roles";

/** Role cho middleware: JWT claim trước, fallback cookie `authRole` (sync từ JWT). */
export function resolveRoleFromRequest(
  token: string | undefined,
  roleCookie: string | undefined
): AppRole | null {
  const fromJwt = resolveRoleFromRoles(getRolesFromToken(token));
  if (fromJwt) return fromJwt;

  const fromCookie = normalizeAppRole(roleCookie);
  if (fromCookie) return fromCookie;

  return null;
}

export function readAuthCookies(request: {
  cookies: { get: (name: string) => { value: string } | undefined };
}): { token?: string; roleCookie?: string } {
  return {
    token: request.cookies.get(AUTH_TOKEN_COOKIE)?.value,
    roleCookie: request.cookies.get(AUTH_ROLE_COOKIE)?.value,
  };
}
