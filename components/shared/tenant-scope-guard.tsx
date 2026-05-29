"use client";

import { useEffect, type ReactNode } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectOrganizationId } from "@/lib/redux/slices/authSlice";
import { writeFoundationSession } from "@/lib/support/foundation/session-context";
import { getPostLoginPath } from "@/lib/support/auth/post-login-route";
import {
  buildOrgScopedPath,
  isUuidSegment,
  parseTenantPath,
} from "@/lib/support/routing/tenant-routes";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_ADMIN } from "@/lib/types/roles";

type TenantScopeGuardProps = {
  children: ReactNode;
  /** When true, URL must include [locationId] and session syncs from it. */
  requireBranch?: boolean;
};

export function TenantScopeGuard({ children, requireBranch = false }: TenantScopeGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const jwtOrgId = useAppSelector(selectOrganizationId);
  const { role } = useAuth();

  const orgId = typeof params.orgId === "string" ? params.orgId : null;
  const locationId =
    typeof params.locationId === "string" ? params.locationId : null;

  const orgMismatch =
    jwtOrgId && orgId && isUuidSegment(orgId) && jwtOrgId.toLowerCase() !== orgId.toLowerCase();

  useEffect(() => {
    if (orgMismatch && role) {
      router.replace(getPostLoginPath(role, jwtOrgId ?? undefined, null));
    }
  }, [orgMismatch, role, router, jwtOrgId]);

  useEffect(() => {
    if (!requireBranch || !locationId || !isUuidSegment(locationId)) return;
    writeFoundationSession({
      selectedLocationId: locationId,
    });
  }, [requireBranch, locationId]);

  useEffect(() => {
    if (!requireBranch || !orgId) return;
    if (locationId && isUuidSegment(locationId)) return;
    const parsed = parseTenantPath(pathname);
    if (parsed?.kind === "org") return;
    if (role === ROLE_ADMIN) {
      router.replace(buildOrgScopedPath(orgId, ROLE_ADMIN, "workspace"));
    }
  }, [requireBranch, locationId, orgId, pathname, role, router]);

  if (orgMismatch) return null;

  return <>{children}</>;
}
