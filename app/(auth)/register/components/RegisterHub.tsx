"use client";

import Link from "next/link";
import { Building2Icon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RegisterHub() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Chọn loại tài khoản bạn muốn tạo trên Wokki.
      </p>

      <div className="grid gap-4">
        <Link
          href="/register/org"
          className="flex items-start gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-brand-blue/40 hover:bg-muted/30"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
            <Building2Icon className="size-5" aria-hidden />
          </div>
          <div className="space-y-1 text-left">
            <p className="font-semibold">Tạo tổ chức mới</p>
            <p className="text-sm text-muted-foreground">
              Tôi là chủ/quản lý, muốn đăng ký doanh nghiệp trên Wokki.
            </p>
          </div>
        </Link>

        <Link
          href="/register/employee"
          className="flex items-start gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-brand-blue/40 hover:bg-muted/30"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <UserIcon className="size-5" aria-hidden />
          </div>
          <div className="space-y-1 text-left">
            <p className="font-semibold">Tôi là nhân viên</p>
            <p className="text-sm text-muted-foreground">
              Tôi muốn tham gia công ty đã có trên Wokki.
            </p>
          </div>
        </Link>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-blue underline-offset-4 hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
