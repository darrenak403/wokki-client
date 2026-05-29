"use client";

import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import { parseTenantPath } from "@/lib/support/routing/tenant-routes";

export function useTenantParams() {
  const params = useParams();
  const pathname = usePathname();

  return useMemo(() => {
    const parsed = parseTenantPath(pathname);
    const orgId = typeof params.orgId === "string" ? params.orgId : parsed?.orgId ?? null;
    const locationId =
      typeof params.locationId === "string"
        ? params.locationId
        : parsed?.kind === "branch"
          ? parsed.locationId
          : null;

    return {
      orgId,
      locationId,
      parsed,
      isBranchScoped: Boolean(orgId && locationId),
      isOrgScoped: parsed?.kind === "org",
    };
  }, [params.orgId, params.locationId, pathname]);
}
