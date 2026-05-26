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
  const isJoinPath = pathname === "/join";
  const shouldCheck = isAuthenticated && role === ROLE_USER && !isPendingPath && !isJoinPath;

  const { data: membership, isFetched, isError, error } = useMyLocationMembership({
    enabled: shouldCheck,
  });

  const isNoEmployee = isError && isApiError(error) && error.httpStatus === 404;
  const isActive = membership?.status === "Active";
  // 404 = no Employee profile yet — send to /pending to show "contact manager" message
  const shouldRedirectToNoEmployee = shouldCheck && isFetched && isNoEmployee;
  // 200+null means no membership record yet — send to /join to pick a location
  const shouldRedirectToJoin = shouldCheck && isFetched && !isNoEmployee && membership === null;
  // Non-active membership record (Pending/Rejected/Left) — send to /pending
  const shouldRedirectToPending = shouldCheck && isFetched && !isNoEmployee && !isActive && membership !== null;

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
    if (shouldRedirectToNoEmployee) router.replace("/pending");
  }, [shouldRedirectToNoEmployee, router]);

  useEffect(() => {
    if (shouldRedirectToJoin) router.replace("/join");
  }, [shouldRedirectToJoin, router]);

  useEffect(() => {
    if (shouldRedirectToPending) router.replace("/pending");
  }, [shouldRedirectToPending, router]);

  // Suppress render during auth hydration or while unauthenticated
  if (!isAuthenticated) return null;

  // Wait for membership check result
  if (shouldCheck && !isFetched) return null;

  // Redirecting
  if (shouldRedirectToNoEmployee || shouldRedirectToJoin || shouldRedirectToPending) return null;

  return <>{children}</>;
}
