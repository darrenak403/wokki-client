import { normalizeAppRole } from "@/lib/auth/normalize-role";
import type { AuthUser } from "@/types/auth";

export function normalizeAuthUser(data: unknown): AuthUser | null {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const id = String(record.id ?? record.Id ?? "").trim();
  const email = String(record.email ?? record.Email ?? "").trim();
  const role = normalizeAppRole(record.role ?? record.Role);

  if (!id || !email || !role) return null;

  return { id, email, role };
}
