"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAppNavForRole } from "@/components/app/app-nav";
import { useSwapInboxPendingCount } from "@/hooks/useSwapInboxPendingCount";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, logout, isLoading } = useAuth();
  const navItems = role ? getAppNavForRole(role) : [];
  const swapPendingCount = useSwapInboxPendingCount();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-4 py-4">
          <Link href={navItems[0]?.href ?? "/"} className="text-lg font-semibold tracking-tight">
            Wokki
          </Link>
          {user ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
          ) : null}
          {role ? (
            <p className="mt-0.5 text-xs font-medium text-primary">{role}</p>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Điều hướng ứng dụng">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="flex items-center justify-between gap-2">
                  {item.label}
                  {item.showSwapPendingBadge && swapPendingCount > 0 ? (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground tabular-nums">
                      {swapPendingCount > 99 ? "99+" : swapPendingCount}
                    </span>
                  ) : null}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-2 space-y-1">
          <div className="flex items-center justify-between px-2 py-1">
            <ThemeToggle />
          </div>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => logout()}
            disabled={isLoading}
          >
            <LogOutIcon className="size-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
