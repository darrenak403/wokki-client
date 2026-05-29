"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { PlatformDashboardPanel } from "@/app/(platform)/platform/components/PlatformDashboardPanel";
import { Button } from "@/components/ui/button";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <header className="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800 md:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <Link href="/platform" className="text-lg font-semibold tracking-tight">
              Wokki Platform
            </Link>
            <p className="text-sm text-muted-foreground">Vận hành nền tảng</p>
          </div>
          <div className="flex items-center gap-2">
            {user?.email ? (
              <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={() => void logout()}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export function PlatformHome() {
  return <PlatformDashboardPanel />;
}
