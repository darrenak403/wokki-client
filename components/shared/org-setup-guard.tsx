"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useOrgStatsQuery } from "@/hooks/useOrgStats";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectAppRole } from "@/lib/redux/slices/authSlice";
import { buildOrgScopedPath, buildBranchScopedPath } from "@/lib/support/routing/tenant-routes";
import { readFoundationSession } from "@/lib/support/foundation/session-context";
import { useTenantParams } from "@/hooks/useTenantParams";
import { ROLE_ADMIN } from "@/lib/types/roles";

/** Org Admin chưa có chi nhánh → onboarding wizard. */
export function OrgSetupGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAppSelector(selectAppRole);
  const { orgId } = useTenantParams();
  const isAdmin = role === ROLE_ADMIN;

  const onboardingPath =
    orgId != null ? buildOrgScopedPath(orgId, ROLE_ADMIN, "onboarding") : null;

  const bypass =
    onboardingPath != null &&
    (pathname === onboardingPath || pathname.startsWith(`${onboardingPath}/`));

  const { data: stats, isFetched } = useOrgStatsQuery({
    enabled: isAdmin && !bypass,
  });

  useEffect(() => {
    if (!isAdmin || bypass || !isFetched || !orgId) return;
    if (stats && stats.locationCount === 0 && onboardingPath) {
      router.replace(onboardingPath);
    }
  }, [isAdmin, bypass, isFetched, stats, router, orgId, onboardingPath]);

  useEffect(() => {
    if (!isAdmin || !isFetched || !stats || !orgId) return;
    if (stats.locationCount > 0 && onboardingPath && pathname === onboardingPath) {
      const firstLoc = readFoundationSession().selectedLocationId;
      if (firstLoc) {
        router.replace(buildBranchScopedPath(orgId, firstLoc, ROLE_ADMIN, "dashboard"));
      } else {
        router.replace(buildOrgScopedPath(orgId, ROLE_ADMIN, "workspace"));
      }
    }
  }, [isAdmin, isFetched, stats, pathname, router, orgId, onboardingPath]);

  return <>{children}</>;
}
