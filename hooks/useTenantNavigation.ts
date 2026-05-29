"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTenantParams } from "@/hooks/useTenantParams";
import { writeFoundationSession } from "@/lib/support/foundation/session-context";
import { setBranchIdCookie } from "@/lib/support/routing/branch-cookie";
import {
  buildBranchScopedPath,
  buildOrgScopedPath,
  parseTenantPath,
} from "@/lib/support/routing/tenant-routes";
import type { AppRole } from "@/lib/types/roles";
import { isAppRole } from "@/lib/types/roles";

export function useTenantNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useAuth();
  const { orgId, locationId, parsed } = useTenantParams();

  const switchBranch = useCallback(
    (nextLocationId: string, targetRole?: AppRole) => {
      if (!orgId) return;
      const activeRole = targetRole ?? (role && isAppRole(role) ? role : undefined);
      if (!activeRole) return;

      setBranchIdCookie(nextLocationId);
      writeFoundationSession({
        selectedLocationId: nextLocationId,
        selectedDepartmentId: null,
      });

      const current = parseTenantPath(pathname);
      if (current?.kind === "branch" && current.featurePath) {
        router.push(
          buildBranchScopedPath(orgId, nextLocationId, current.role, current.featurePath)
        );
        return;
      }

      router.push(buildBranchScopedPath(orgId, nextLocationId, activeRole, "dashboard"));
    },
    [orgId, pathname, role, router]
  );

  const branchPath = useCallback(
    (featurePath: string, targetRole?: AppRole) => {
      if (!orgId || !locationId) return pathname;
      const activeRole = targetRole ?? (role && isAppRole(role) ? role : undefined);
      if (!activeRole) return pathname;
      return buildBranchScopedPath(orgId, locationId, activeRole, featurePath);
    },
    [orgId, locationId, pathname, role]
  );

  const orgPath = useCallback(
    (featurePath: string, targetRole?: AppRole) => {
      if (!orgId) return pathname;
      const activeRole = targetRole ?? (role && isAppRole(role) ? role : undefined);
      if (!activeRole) return pathname;
      return buildOrgScopedPath(orgId, activeRole, featurePath);
    },
    [orgId, pathname, role]
  );

  return {
    orgId,
    locationId,
    parsed,
    switchBranch,
    branchPath,
    orgPath,
  };
}
