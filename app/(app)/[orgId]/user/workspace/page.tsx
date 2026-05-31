"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMyLocationMembership } from "@/hooks/useLocationMembership";
import { useTenantParams } from "@/hooks/useTenantParams";
import { writeFoundationSession } from "@/lib/support/foundation/session-context";
import { setBranchIdCookie } from "@/lib/support/routing/branch-cookie";
import { buildBranchScopedPath } from "@/lib/support/routing/tenant-routes";
import { ROLE_USER } from "@/lib/types/roles";

export default function UserWorkspaceRedirectPage() {
  const router = useRouter();
  const { orgId } = useTenantParams();
  const { data: membership, isLoading, isError } = useMyLocationMembership();

  useEffect(() => {
    if (!orgId || !membership?.locationId) return;

    setBranchIdCookie(membership.locationId);
    writeFoundationSession({
      selectedLocationId: membership.locationId,
      selectedDepartmentId: null,
    });
    router.replace(buildBranchScopedPath(orgId, membership.locationId, ROLE_USER, "dashboard"));
  }, [membership?.locationId, orgId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Đang mở khu làm việc nhân viên…</p>
      </div>
    );
  }

  if (isError || !membership?.locationId) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">
          Tài khoản này chưa có chi nhánh làm việc active. Vui lòng liên hệ Admin của tổ chức.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">Đang chuyển đến workspace của bạn…</p>
    </div>
  );
}
