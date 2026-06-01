"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectIsOrgLessUser,
} from "@/lib/redux/slices/authSlice";
import { usePersistBootstrapped } from "@/hooks/usePersistBootstrapped";

/** Chuyển user chưa thuộc org ra khỏi shell `(app)`. */
export function OrgMemberGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isPersistBootstrapped = usePersistBootstrapped();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthLoading = useAppSelector(selectAuthLoading);
  const isOrgLess = useAppSelector(selectIsOrgLessUser);

  useEffect(() => {
    if (!isPersistBootstrapped || isAuthLoading) return;
    if (isAuthenticated && isOrgLess) {
      router.replace("/discover");
    }
  }, [isPersistBootstrapped, isAuthLoading, isAuthenticated, isOrgLess, router]);

  if (!isPersistBootstrapped || (isAuthenticated && isOrgLess)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Đang chuyển hướng…
      </div>
    );
  }

  return <>{children}</>;
}
