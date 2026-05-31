"use client";

import { CalendarClockIcon, MailIcon, ShieldAlertIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  orgPackageUserMessage,
  ORG_PACKAGE_EXPIRED,
  ORG_PACKAGE_NOT_ACTIVATED,
  type OrgPackageReason,
} from "@/lib/support/auth/org-package";

type OrgPackageNoticeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: OrgPackageReason;
};

export function OrgPackageNoticeDialog({
  open,
  onOpenChange,
  reason,
}: OrgPackageNoticeDialogProps) {
  const code =
    reason === "expired" ? ORG_PACKAGE_EXPIRED : ORG_PACKAGE_NOT_ACTIVATED;
  const title =
    reason === "expired" ? "Gói tổ chức đã hết hạn" : "Chưa có gói sử dụng";
  const Icon = reason === "expired" ? CalendarClockIcon : ShieldAlertIcon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
            <Icon className="size-7 text-amber-700 dark:text-amber-400" aria-hidden />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {orgPackageUserMessage(code)}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="flex items-start gap-2">
            <MailIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Vui lòng liên hệ <strong>Wokki admin</strong> (đội vận hành nền tảng) để được{" "}
              {reason === "expired" ? "gia hạn" : "kích hoạt"} gói sử dụng cho tổ chức của bạn.
              Sau khi gói được bật, đăng nhập lại bình thường.
            </span>
          </p>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button type="button" className="min-w-32" onClick={() => onOpenChange(false)}>
            Đã hiểu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
