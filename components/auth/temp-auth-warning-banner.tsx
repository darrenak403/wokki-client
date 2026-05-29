"use client";

import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TempAuthWarningBannerProps = {
  onChangePassword: () => void;
};

export function TempAuthWarningBanner({ onChangePassword }: TempAuthWarningBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        "border-b border-amber-200/80 bg-amber-50 px-4 py-3 text-amber-950",
        "dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 md:px-2">
        <AlertTriangleIcon className="size-4 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1 text-sm leading-relaxed">
          Bạn đang dùng <strong>mật khẩu tạm</strong>. Vui lòng đổi mật khẩu trong{" "}
          <strong>Cài đặt → Đặt lại mật khẩu</strong> để bảo mật tài khoản — bạn vẫn có thể
          tiếp tục dùng app bình thường.
        </p>
        <Button type="button" size="sm" className="shrink-0" onClick={onChangePassword}>
          Đổi mật khẩu
        </Button>
      </div>
    </div>
  );
}
