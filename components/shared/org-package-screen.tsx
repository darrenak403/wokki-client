"use client";

import Link from "next/link";
import { CalendarClockIcon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  orgPackageUserMessage,
  ORG_PACKAGE_EXPIRED,
  ORG_PACKAGE_NOT_ACTIVATED,
  type OrgPackageReason,
} from "@/lib/support/auth/org-package";
import { useAuth } from "@/hooks/useAuth";

type OrgPackageScreenProps = {
  reason: OrgPackageReason;
};

export function OrgPackageScreen({ reason }: OrgPackageScreenProps) {
  const { logout, organizationName } = useAuth();
  const code =
    reason === "expired" ? ORG_PACKAGE_EXPIRED : ORG_PACKAGE_NOT_ACTIVATED;
  const title =
    reason === "expired" ? "Gói tổ chức đã hết hạn" : "Chưa có gói sử dụng";
  const Icon = reason === "expired" ? CalendarClockIcon : ShieldAlertIcon;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="max-w-lg space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
            <Icon className="size-8 text-amber-700 dark:text-amber-400" aria-hidden />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {organizationName ? (
            <p className="text-sm font-medium text-muted-foreground">{organizationName}</p>
          ) : null}
          <p className="text-muted-foreground">{orgPackageUserMessage(code)}</p>
          <p className="text-sm text-muted-foreground">
            Sau khi Wokki admin gia hạn hoặc bật gói, mọi tài khoản trong tổ chức (Admin, Manager,
            nhân viên) có thể đăng nhập lại.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={() => void logout()}>
            Đăng xuất
          </Button>
          <Button render={<Link href="/login" />}>Về đăng nhập</Button>
        </div>
      </div>
    </div>
  );
}
