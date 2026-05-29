import { jwtDecode } from "jwt-decode";
import {
  normalizeAppRole,
  normalizeSessionRole,
} from "@/lib/support/auth/normalize-role";
import {
  JWT_ROLE_CLAIM,
  type AppRole,
  type SessionRole,
} from "@/lib/types/roles";
import type { AuthUser } from "@/types/auth";

type JwtPayload = Record<string, unknown> & {
  role?: string | string[];
  exp?: number;
  sub?: string;
  email?: string;
  organization_id?: string;
  organizationId?: string;
};

export function readOrganizationIdFromPayload(payload: JwtPayload): string | null {
  const raw = payload.organization_id ?? payload.organizationId;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readSessionRoleFromPayload(payload: JwtPayload): SessionRole | null {
  const raw = payload[JWT_ROLE_CLAIM] ?? payload.role;
  if (!raw) return null;

  const value = Array.isArray(raw) ? raw[0] : raw;
  return normalizeSessionRole(value);
}

/** @deprecated Prefer readSessionRoleFromPayload */
export function readRoleFromPayload(payload: JwtPayload): AppRole | null {
  const raw = payload[JWT_ROLE_CLAIM] ?? payload.role;
  if (!raw) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return normalizeAppRole(value);
}

export function readRolesFromPayload(payload: JwtPayload): AppRole[] {
  const role = readRoleFromPayload(payload);
  return role ? [role] : [];
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function getRolesFromToken(token: string | undefined): AppRole[] {
  if (!token) return [];
  const payload = decodeJwtPayload(token);
  if (!payload) return [];
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return [];
  return readRolesFromPayload(payload);
}

export function getSessionRoleFromToken(token: string | undefined): SessionRole | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return readSessionRoleFromPayload(payload);
}

export function userFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const role = readSessionRoleFromPayload(payload);
  if (!role) return null;

  const id = typeof payload.sub === "string" ? payload.sub : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  if (!id) return null;

  return {
    id,
    email,
    role,
    organizationId: readOrganizationIdFromPayload(payload),
  };
}
