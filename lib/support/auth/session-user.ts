import { userFromToken } from "@/lib/support/auth/jwt-roles";
import type { AuthUser } from "@/types/auth";

/** User + role từ access token JWT (không gọi API). */
export function sessionUserFromAccessToken(accessToken: string): AuthUser | null {
  return userFromToken(accessToken);
}
