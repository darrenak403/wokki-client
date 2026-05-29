"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UserXIcon } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectAppRole,
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/lib/redux/slices/authSlice";
import { ROLE_USER } from "@/lib/types/roles";
import { useMyLocationMembership } from "@/hooks/useLocationMembership";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const { logout } = useAuth();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthLoading = useAppSelector(selectAuthLoading);
  const role = useAppSelector(selectAppRole);

  const shouldCheck = isAuthenticated && role === ROLE_USER;

  const { isFetched, isError, error } = useMyLocationMembership({
    enabled: shouldCheck,
  });

  const isNoEmployee = isError && isApiError(error) && error.httpStatus === 404;

  useEffect(() => {
    if (!isAuthenticated && !isAuthLoading) router.replace("/login");
  }, [isAuthenticated, isAuthLoading, router]);

  if (!isAuthenticated) return null;

  if (shouldCheck && !isFetched) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Đang tải thông tin nhân viên…
      </div>
    );
  }

  if (shouldCheck && isNoEmployee) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <UserXIcon className="size-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Tài khoản chưa được kích hoạt</h1>
            <p className="text-muted-foreground">
              Org Admin cần tạo hồ sơ nhân viên và gán phòng ban trước khi bạn dùng app. Liên hệ
              quản lý để được cấp quyền.
            </p>
          </div>
          <Button variant="ghost" onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
