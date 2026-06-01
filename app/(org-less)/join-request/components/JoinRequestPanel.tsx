"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { refreshTokenAsync } from "@/lib/redux/slices/authSlice";
import {
  useCancelOrgJoinMutation,
  useMyOrgJoinRequestQuery,
} from "@/hooks/useOrgJoin";
import { resolveAppLandingPath } from "@/lib/support/auth/resolve-app-landing-path";
import { readFoundationSession } from "@/lib/support/foundation/session-context";
import { selectIsOrgLessUser } from "@/lib/redux/slices/authSlice";
import { usePersistBootstrapped } from "@/hooks/usePersistBootstrapped";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { OrgJoinRequestStatus } from "@/types/org-join";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function JoinRequestPanel() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isPersistBootstrapped = usePersistBootstrapped();
  const isOrgLess = useAppSelector(selectIsOrgLessUser);
  const { role, organizationId, isAuthenticated } = useAuth();
  const { data, isLoading, refetch } = useMyOrgJoinRequestQuery();
  const cancelMutation = useCancelOrgJoinMutation();

  const request = data?.success ? data.data : null;
  const status: OrgJoinRequestStatus | null = request?.status ?? null;

  useEffect(() => {
    if (!isPersistBootstrapped || !isAuthenticated) return;
    if (isOrgLess) return;
    const branchId = readFoundationSession().selectedLocationId;
    void resolveAppLandingPath(role, organizationId, branchId).then((path) => router.replace(path));
  }, [isPersistBootstrapped, isAuthenticated, isOrgLess, organizationId, role, router]);

  useEffect(() => {
    if (status !== "Approved" || !role || isOrgLess) return;
    const branchId = readFoundationSession().selectedLocationId;
    void resolveAppLandingPath(role, organizationId, branchId).then((path) => router.replace(path));
  }, [status, role, organizationId, isOrgLess, router]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  }

  if (!request) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Bạn chưa gửi yêu cầu tham gia tổ chức nào.</p>
        <Button type="button" onClick={() => router.push("/discover")}>
          Chọn tổ chức
        </Button>
      </div>
    );
  }

  if (status === "Pending") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Đang chờ duyệt</h1>
          <p className="text-sm text-muted-foreground">
            Bạn đã gửi yêu cầu tham gia <strong>{request.organizationName}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            Gửi lúc: {formatDate(request.submittedAt)}
          </p>
        </div>
        <Alert>
          <AlertDescription>
            Quản trị viên sẽ xem xét và gán chi nhánh/phòng ban cho bạn. Bạn sẽ nhận quyền truy
            cập app sau khi được duyệt.
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              try {
                await dispatch(refreshTokenAsync()).unwrap();
              } catch {
                // keep going — still refetch join status
              }
              await refetch();
              const branchId = readFoundationSession().selectedLocationId;
              void resolveAppLandingPath(role, organizationId, branchId).then((path) =>
                router.replace(path)
              );
            }}
          >
            Làm mới
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={cancelMutation.isPending}
            onClick={async () => {
              await cancelMutation.mutateAsync();
              router.push("/discover");
            }}
          >
            Hủy yêu cầu
          </Button>
        </div>
      </div>
    );
  }

  if (status === "Rejected") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Yêu cầu không được chấp nhận</h1>
        <p className="text-sm text-muted-foreground">
          <strong>{request.organizationName}</strong>
          {request.rejectNote ? ` — ${request.rejectNote}` : null}
        </p>
        <Button type="button" onClick={() => router.push("/discover")}>
          Chọn tổ chức khác
        </Button>
      </div>
    );
  }

  if (status === "Expired" || status === "Cancelled") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {status === "Expired" ? "Yêu cầu đã hết hạn" : "Yêu cầu đã hủy"}
        </h1>
        <p className="text-sm text-muted-foreground">{request.organizationName}</p>
        <Button type="button" onClick={() => router.push("/discover")}>
          Chọn tổ chức
        </Button>
      </div>
    );
  }

  return null;
}
