"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClockIcon, RefreshCwIcon, XCircleIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMyLocationMembership } from "@/hooks/useLocationMembership";
import { Button } from "@/components/ui/button";
import { ROLE_USER } from "@/lib/types/roles";

export default function PendingPage() {
  const router = useRouter();
  const { logout, role } = useAuth();
  const { data: membership, isFetching, refetch } = useMyLocationMembership({
    enabled: role === ROLE_USER,
  });

  // Forward out of /pending once membership is approved
  useEffect(() => {
    if (membership?.status === "Active") router.replace("/");
  }, [membership?.status, router]);

  const isRejected = membership?.status === "Rejected";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div
            className={
              isRejected
                ? "flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
                : "flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30"
            }
          >
            {isRejected ? (
              <XCircleIcon className="size-8 text-red-600 dark:text-red-400" />
            ) : (
              <ClockIcon className="size-8 text-amber-600 dark:text-amber-400" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {isRejected ? "Yêu cầu bị từ chối" : "Chờ xác nhận tham gia"}
          </h1>
          <p className="text-muted-foreground">
            {isRejected
              ? "Yêu cầu tham gia chi nhánh của bạn đã bị từ chối. Vui lòng liên hệ quản lý để biết thêm chi tiết."
              : "Yêu cầu của bạn đang chờ được duyệt. Vui lòng chờ quản lý xác nhận."}
          </p>
        </div>

        {membership?.locationName && (
          <p className="text-sm text-muted-foreground">
            Chi nhánh:{" "}
            <span className="font-medium text-foreground">{membership.locationName}</span>
          </p>
        )}

        {isRejected && membership?.note && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            Lý do: {membership.note}
          </p>
        )}

        <div className="flex justify-center gap-3">
          {!isRejected && (
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCwIcon className={isFetching ? "animate-spin" : ""} />
              Làm mới
            </Button>
          )}
          <Button variant="ghost" onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}
