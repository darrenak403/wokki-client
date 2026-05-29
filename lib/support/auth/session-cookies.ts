import { deleteCookie, setCookie } from "cookies-next";
import type { SessionRole } from "@/lib/types/roles";
import { getAuthCookieConfig } from "@/utils/cookieConfig";
import apiService from "@/lib/api/core";

export const AUTH_TOKEN_COOKIE = "authToken";
export const AUTH_ROLE_COOKIE = "authRole";

/** Gắn access token lên cookie + axios — gọi trước mọi API cần Bearer. */
export function attachAccessToken(accessToken: string): void {
  setCookie(AUTH_TOKEN_COOKIE, accessToken, getAuthCookieConfig());
  apiService.setAuthToken(accessToken);
}

export function syncRoleCookie(role: SessionRole | null | undefined): void {
  const options = getAuthCookieConfig();
  if (role) {
    setCookie(AUTH_ROLE_COOKIE, role, options);
  } else {
    deleteCookie(AUTH_ROLE_COOKIE, authCookieDeleteOptions());
  }
}

export async function persistSession(
  accessToken: string,
  refreshToken: string,
  role?: SessionRole | null
): Promise<{ accessToken: string; refreshToken: string }> {
  attachAccessToken(accessToken);
  syncRoleCookie(role);
  return { accessToken, refreshToken };
}

function authCookieDeleteOptions() {
  const { path, domain, secure, sameSite } = getAuthCookieConfig();
  return { path: path ?? "/", domain, secure, sameSite };
}

export function clearSessionCookies(): void {
  const options = authCookieDeleteOptions();
  deleteCookie(AUTH_TOKEN_COOKIE, options);
  deleteCookie(AUTH_ROLE_COOKIE, options);
  apiService.setAuthToken(null);
}
