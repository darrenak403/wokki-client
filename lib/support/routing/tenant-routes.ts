import {
  APP_AREA_PREFIX,
} from "@/lib/support/auth/app-routes";
import type { AppRole } from "@/lib/types/roles";
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";

/** RFC 4122 UUID (v4-style segment layout). */
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** URL path segment (lowercase) — khác JWT claim `Admin` | `Manager` | `User`. */
export function roleToUrlSegment(role: AppRole): string {
  return APP_AREA_PREFIX[role].replace(/^\//, "");
}

export function roleFromUrlSegment(segment: string): AppRole | null {
  const key = segment.trim().toLowerCase();
  if (key === "admin") return ROLE_ADMIN;
  if (key === "manager") return ROLE_MANAGER;
  if (key === "user") return ROLE_USER;
  if (segment === ROLE_ADMIN || segment === ROLE_MANAGER || segment === ROLE_USER) {
    return segment;
  }
  return null;
}

export type ParsedTenantPath =
  | {
      kind: "branch";
      orgId: string;
      locationId: string;
      role: AppRole;
      featurePath: string;
    }
  | {
      kind: "org";
      orgId: string;
      role: AppRole;
      featurePath: string;
    };

export function isUuidSegment(value: string): boolean {
  return UUID_RE.test(value);
}

/** `/admin/schedule` style (legacy, no org/branch prefix). */
export function isLegacyRolePath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/manager" ||
    pathname.startsWith("/manager/") ||
    pathname === "/user" ||
    pathname.startsWith("/user/")
  );
}

export function parseTenantPath(pathname: string): ParsedTenantPath | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const [a, b, c] = segments;

  // /{orgId}/admin/onboarding
  if (isUuidSegment(a)) {
    const role = roleFromUrlSegment(b);
    if (role) {
      const featurePath = segments.slice(2).join("/");
      return { kind: "org", orgId: a, role, featurePath };
    }
  }

  // /{orgId}/{locationId}/admin/schedule
  if (isUuidSegment(a) && isUuidSegment(b) && segments.length >= 4) {
    const role = roleFromUrlSegment(segments[2]!);
    if (role) {
      const featurePath = segments.slice(3).join("/");
      return { kind: "branch", orgId: a, locationId: b, role, featurePath };
    }
  }

  return null;
}

export function buildOrgScopedPath(
  orgId: string,
  role: AppRole,
  featurePath: string
): string {
  const suffix = featurePath.replace(/^\//, "");
  const roleSeg = roleToUrlSegment(role);
  return suffix ? `/${orgId}/${roleSeg}/${suffix}` : `/${orgId}/${roleSeg}`;
}

export function buildBranchScopedPath(
  orgId: string,
  locationId: string,
  role: AppRole,
  featurePath: string
): string {
  const suffix = featurePath.replace(/^\//, "");
  const prefix = APP_AREA_PREFIX[role];
  return suffix
    ? `/${orgId}/${locationId}${prefix}/${suffix}`
    : `/${orgId}/${locationId}${prefix}`;
}

/** Map legacy `/admin/dashboard` → branch-scoped path. */
export function legacyPathToBranchScoped(
  legacyPathname: string,
  orgId: string,
  locationId: string,
  role: AppRole
): string {
  const prefix = APP_AREA_PREFIX[role];
  if (legacyPathname === prefix || legacyPathname.startsWith(`${prefix}/`)) {
    const feature = legacyPathname.slice(prefix.length).replace(/^\//, "") || "dashboard";
    return buildBranchScopedPath(orgId, locationId, role, feature);
  }
  return buildBranchScopedPath(orgId, locationId, role, "dashboard");
}
