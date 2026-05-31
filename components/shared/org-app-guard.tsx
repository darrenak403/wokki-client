"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectIsAuthenticated,
  selectIsPlatformOperator,
} from "@/lib/redux/slices/authSlice";
import { PLATFORM_HOME_PATH } from "@/lib/support/auth/app-routes";

/** Chặn PlatformOperator khỏi shell org app. */
export function OrgAppGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isPlatformOperator = useAppSelector(selectIsPlatformOperator);

  useEffect(() => {
    if (!isAuthenticated || !isPlatformOperator) return;
    if (pathname !== PLATFORM_HOME_PATH) {
      router.replace(PLATFORM_HOME_PATH);
    }
  }, [isAuthenticated, isPlatformOperator, pathname, router]);

  if (isPlatformOperator) return null;

  return <>{children}</>;
}
