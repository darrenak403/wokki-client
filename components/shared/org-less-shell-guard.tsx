"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectIsOrgLessUser,
  selectIsPlatformOperator,
  selectOrganizationId,
  selectUserRole,
} from "@/lib/redux/slices/authSlice";
import { usePersistBootstrapped } from "@/hooks/usePersistBootstrapped";
import { resolveAppLandingPath } from "@/lib/support/auth/resolve-app-landing-path";
import { readFoundationSession } from "@/lib/support/foundation/session-context";

export function OrgLessShellGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();
  const isPersistBootstrapped = usePersistBootstrapped();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthLoading = useAppSelector(selectAuthLoading);
  const isOrgLess = useAppSelector(selectIsOrgLessUser);
  const isPlatformOperator = useAppSelector(selectIsPlatformOperator);
  const role = useAppSelector(selectUserRole);
  const organizationId = useAppSelector(selectOrganizationId);

  useEffect(() => {
    if (!isPersistBootstrapped || isAuthLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (isPlatformOperator) {
      router.replace("/platform");
      return;
    }
    if (!isOrgLess && role) {
      const branchId = readFoundationSession().selectedLocationId;
      void resolveAppLandingPath(role, organizationId, branchId).then((path) =>
        router.replace(path)
      );
    }
  }, [
    isPersistBootstrapped,
    isAuthLoading,
    isAuthenticated,
    isOrgLess,
    isPlatformOperator,
    organizationId,
    role,
    router,
  ]);

  if (!isPersistBootstrapped || isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  if (!isAuthenticated || isPlatformOperator || !isOrgLess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-semibold text-brand-blue">Wokki</span>
        <button
          type="button"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
          onClick={() => void logout()}
        >
          Đăng xuất
        </button>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">{children}</main>
    </div>
  );
}
