import {
  decodeJwtPayload,
  readOrganizationIdFromPayload,
  readSessionRoleFromPayload,
} from "@/lib/support/auth/jwt-roles";

export { decodeJwtPayload, readOrganizationIdFromPayload, readSessionRoleFromPayload };

export function readOrganizationIdFromToken(token: string | undefined): string | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return readOrganizationIdFromPayload(payload);
}

export function readSessionRoleFromToken(token: string | undefined) {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return readSessionRoleFromPayload(payload);
}
