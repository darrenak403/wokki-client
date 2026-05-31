import { getPostLoginPath as resolvePostLoginPath } from "@/lib/support/auth/post-login-route";
import { normalizeSessionRole } from "@/lib/support/auth/normalize-role";

export function getPostLoginPath(role: unknown): string {
  return resolvePostLoginPath(normalizeSessionRole(role));
}
