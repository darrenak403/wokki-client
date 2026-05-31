"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectAuthLoading,
  selectAuthToken,
  selectIsAuthenticated,
  selectIsPlatformOperator,
} from "@/lib/redux/slices/authSlice";

/** Redirects unauthenticated users away from platform console routes. */
export function PlatformAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isPlatformOperator = useAppSelector(selectIsPlatformOperator);
  const isLoading = useAppSelector(selectAuthLoading);
  const token = useAppSelector(selectAuthToken);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  if (!isAuthenticated || !token || !isPlatformOperator) {
    return null;
  }

  return <>{children}</>;
}
