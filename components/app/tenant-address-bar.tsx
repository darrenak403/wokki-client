"use client";

import { usePathname } from "next/navigation";
import { useTenantParams } from "@/hooks/useTenantParams";
import { formatTenantAddressBar, parseTenantPath } from "@/lib/support/routing/tenant-routes";

export function TenantAddressBar() {
  const pathname = usePathname();
  const { orgId, locationId } = useTenantParams();
  const parsed = parseTenantPath(pathname);

  if (!orgId) return null;

  const feature =
    parsed?.kind === "branch"
      ? parsed.featurePath.replace(/\//g, " / ")
      : parsed?.kind === "org"
        ? parsed.featurePath
        : undefined;

  return (
    <p
      className="hidden truncate font-mono text-xs text-muted-foreground md:block"
      title={pathname}
    >
      {formatTenantAddressBar(orgId, locationId, feature)}
    </p>
  );
}
