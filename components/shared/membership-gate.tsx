"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectUserRole,
} from "@/lib/redux/slices/authSlice";
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";
import { useMyLocationMembership } from "@/hooks/useLocationMembership";
import type { ApiError } from "@/types/api";

function isApiError(e: unknown): e is ApiError {
  return (
    typeof e === "object" &&
    e !== null &&
    "httpStatus" in e &&
    typeof (e as ApiError).httpStatus === "number"
  );
}

export function MembershipGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthLoading = useAppSelector(selectAuthLoading);
  const role = useAppSelector(selectUserRole);

  const isPendingPath = pathname === "/pending";
  const shouldCheck = isAuthenticated && role === ROLE_USER && !isPendingPath;

  const { data: membership, isFetched, isError, error } = useMyLocationMembership({
    enabled: shouldCheck,
  });

  const isNoEmployee = isError && isApiError(error) && error.httpStatus === 404;
  const isActive = membership?.status === "Active";
  // Only redirect once the query has actually returned a result (isFetched guards premature fire)
  const shouldRedirect = shouldCheck && isFetched && !isNoEmployee && !isActive;

  // Redirect unauthenticated users to login once hydration is settled
  useEffect(() => {
    if (!isAuthenticated && !isAuthLoading) router.replace("/login");
  }, [isAuthenticated, isAuthLoading, router]);

  // Redirect Admin/Manager away from /pending (they should not land there)
  useEffect(() => {
    if (isPendingPath && (role === ROLE_ADMIN || role === ROLE_MANAGER)) {
      router.replace("/");
    }
  }, [isPendingPath, role, router]);

  useEffect(() => {
    if (shouldRedirect) router.replace("/pending");
  }, [shouldRedirect, router]);

  // Suppress render during auth hydration or while unauthenticated
  if (!isAuthenticated) return null;

  // Wait for membership check result
  if (shouldCheck && !isFetched) return null;

  // Redirecting to /pending
  if (shouldRedirect) return null;

  return <>{children}</>;
}
