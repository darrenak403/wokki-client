import { jwtDecode } from "jwt-decode";
import { APP_ROLES, JWT_ROLE_CLAIM, type AppRole } from "@/lib/types/roles";

type JwtPayload = Record<string, unknown> & {
  role?: string | string[];
  exp?: number;
  sub?: string;
  email?: string;
};

export function readRoleFromPayload(payload: JwtPayload): AppRole | null {
  const raw = payload[JWT_ROLE_CLAIM] ?? payload.role;
  if (!raw) return null;

  const value = Array.isArray(raw) ? raw[0] : String(raw);
  if (APP_ROLES.includes(value as AppRole)) return value as AppRole;
  return null;
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

export function userFromToken(token: string): { id: string; email: string; role: AppRole } | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const role = readRoleFromPayload(payload);
  if (!role) return null;

  const id = typeof payload.sub === "string" ? payload.sub : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  if (!id || !email) return null;

  return { id, email, role };
}
