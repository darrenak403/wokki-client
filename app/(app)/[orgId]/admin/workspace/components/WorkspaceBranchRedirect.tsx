"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { useTenantParams } from "@/hooks/useTenantParams";
import { useWorkspaceLocations } from "@/hooks/useWorkspaceLocations";
import { readBranchIdCookie, setBranchIdCookie } from "@/lib/support/routing/branch-cookie";
import {
  buildBranchScopedPath,
  buildOrgScopedPath,
} from "@/lib/support/routing/tenant-routes";
import { ROLE_ADMIN, ROLE_MANAGER } from "@/lib/types/roles";

type WorkspaceRole = typeof ROLE_ADMIN | typeof ROLE_MANAGER;

type WorkspaceBranchRedirectProps = {
  role: WorkspaceRole;
};

export function WorkspaceBranchRedirect({ role }: WorkspaceBranchRedirectProps) {
  const router = useRouter();
  const { orgId } = useTenantParams();
  const { session, setLocationId } = useFoundationSession();
  const isManagerScope = role === ROLE_MANAGER;
  const locationsQuery = useWorkspaceLocations(isManagerScope);
  const locations = useMemo(() => locationsQuery.data ?? [], [locationsQuery.data]);

  const targetLocation = useMemo(() => {
    const preferredLocationId = session.selectedLocationId ?? readBranchIdCookie();
    const preferred = preferredLocationId
      ? locations.find((location) => location.id === preferredLocationId)
      : null;
    return preferred ?? locations[0] ?? null;
  }, [locations, session.selectedLocationId]);

  useEffect(() => {
    if (!orgId || !targetLocation) return;
    setBranchIdCookie(targetLocation.id);
    setLocationId(targetLocation.id);
    router.replace(buildBranchScopedPath(orgId, targetLocation.id, role, "workspace"));
  }, [orgId, role, router, setLocationId, targetLocation]);

  if (locationsQuery.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Đang mở workspace chi nhánh…</p>
      </div>
    );
  }

  if (locationsQuery.isError) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6 text-center">
        <p className="text-sm text-destructive">Không tải được danh sách chi nhánh.</p>
      </div>
    );
  }

  if (!targetLocation) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">
          {role === ROLE_ADMIN
            ? "Tổ chức chưa có chi nhánh. Hãy thiết lập chi nhánh đầu tiên để bắt đầu vận hành."
            : "Bạn chưa được gán quản lý chi nhánh nào. Vui lòng liên hệ Admin của tổ chức."}
        </p>
        {role === ROLE_ADMIN && orgId ? (
          <Link href={buildOrgScopedPath(orgId, ROLE_ADMIN, "onboarding")}>
            <Button type="button">Thiết lập chi nhánh</Button>
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">Đang chuyển đến {targetLocation.name}…</p>
    </div>
  );
}
