"use client";

import { useSearchParams } from "next/navigation";
import { OrgPackageScreen } from "@/components/shared/org-package-screen";
import type { OrgPackageReason } from "@/lib/support/auth/org-package";

function parseReason(value: string | null): OrgPackageReason {
  return value === "expired" ? "expired" : "not-activated";
}

export function OrgPackagePageClient() {
  const searchParams = useSearchParams();
  const reason = parseReason(searchParams.get("reason"));

  return <OrgPackageScreen reason={reason} />;
}
