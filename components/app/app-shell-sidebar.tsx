"use client";

import Link from "next/link";
import { LogOutIcon } from "lucide-react";
import type { AppNavItem } from "@/components/app/app-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SidebarNavLink } from "./app-shell-nav-link";

export type ShellSidebarContentProps = {
  collapsed: boolean;
  homeHref: string;
  isLoading: boolean;
  navItems: AppNavItem[];
  onLogout: () => void;
  onNavigate?: () => void;
  pathname: string;
  role: string | null;
  swapPendingCount: number;
  userEmail?: string;
};

export function ShellSidebarContent({
  collapsed,
  homeHref,
  isLoading,
  navItems,
  onLogout,
  onNavigate,
  pathname,
  swapPendingCount,
}: ShellSidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-3 px-4">
        <Link
          href={homeHref}
          onClick={onNavigate}
          className={cn("flex min-w-0 flex-1 items-center gap-3", collapsed && "justify-center")}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#102854] via-[#4C88C6] to-[#1D4D8F] font-black text-white shadow-lg shadow-[#4C88C6]/25">
            W
          </span>
          {!collapsed ? (
            <span className="truncate text-xl font-extrabold tracking-tight">Wokki</span>
          ) : null}
        </Link>
      </div>

      <Separator />

      <nav
        className={cn(
          "flex flex-1 flex-col gap-1 overflow-y-auto p-3",
          collapsed && "items-center"
        )}
        aria-label="Điều hướng ứng dụng"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badge =
            item.showSwapPendingBadge && swapPendingCount > 0
              ? swapPendingCount > 99
                ? "99+"
                : String(swapPendingCount)
              : null;

          return (
            <SidebarNavLink
              key={item.href}
              badge={badge}
              collapsed={collapsed}
              href={item.href}
              item={item}
              isActive={isActive}
              label={item.label}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>

      <Separator />

      <div className={cn("space-y-2 p-3", collapsed && "flex flex-col items-center")}>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-10 gap-3 rounded-xl text-neutral-600 hover:bg-red-50 hover:text-red-600 dark:text-neutral-300 dark:hover:bg-red-950/30 dark:hover:text-red-300",
            collapsed ? "w-11 px-0" : "w-full justify-start"
          )}
          onClick={onLogout}
          disabled={isLoading}
        >
          <LogOutIcon className="size-4" />
          {!collapsed ? <span>Đăng xuất</span> : <span className="sr-only">Đăng xuất</span>}
        </Button>
      </div>
    </div>
  );
}
