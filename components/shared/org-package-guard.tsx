"use client";

import type { ReactNode } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectAppRole,
  selectAuthLoading,
  selectIsAuthenticated,
  selectIsPlatformOperator,
} from "@/lib/redux/slices/authSlice";
import { useOrgSubscriptionQuery } from "@/hooks/useOrgSubscription";
import { OrgPackageScreen } from "@/components/shared/org-package-screen";
import { isOrgPackageCode } from "@/lib/support/auth/org-package";
import type { ApiError } from "@/types/api";

function isApiError(e: unknown): e is ApiError {
  return typeof e === "object" && e !== null && "messageCode" in e;
}

/** Blocks org app when package is not active or expired (all roles in org). */
export function OrgPackageGuard({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthLoading = useAppSelector(selectAuthLoading);
  const isPlatformOperator = useAppSelector(selectIsPlatformOperator);
  const role = useAppSelector(selectAppRole);

  const shouldCheck =
    isAuthenticated && !isPlatformOperator && Boolean(role);

  const { isFetched, isError, error, data } = useOrgSubscriptionQuery({
    enabled: shouldCheck,
    retry: false,
  });

  const packageCode =
    isError && isApiError(error) && isOrgPackageCode(error.messageCode)
      ? error.messageCode
      : data?.subscriptionStatus === "Expired"
        ? "ORG_PACKAGE_EXPIRED"
        : data?.subscriptionStatus === "NotActivated" || data?.subscriptionStatus === "Disabled"
          ? "ORG_PACKAGE_NOT_ACTIVATED"
          : null;

  if (!shouldCheck) return <>{children}</>;

  if (!isFetched && !packageCode) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Đang kiểm tra gói sử dụng…
      </div>
    );
  }

  if (packageCode) {
    return (
      <OrgPackageScreen
        reason={packageCode === "ORG_PACKAGE_EXPIRED" ? "expired" : "not-activated"}
      />
    );
  }

  return <>{children}</>;
}
