import { ROLE_USER, type SessionRole } from "@/lib/types/roles";

export function isOrgLessUser(
  role: SessionRole | null | undefined,
  organizationId: string | null | undefined
): boolean {
  return role === ROLE_USER && !organizationId;
}
