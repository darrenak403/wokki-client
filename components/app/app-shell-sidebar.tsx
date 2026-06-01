"use client";

import { LogOutIcon } from "lucide-react";
import type { AppNavItem } from "@/components/app/app-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SidebarNavLink } from "./app-shell-nav-link";
import { BranchSwitcher } from "./branch-switcher";
import { WokkiSidebarBrand } from "./wokki-sidebar-brand";

export type ShellSidebarContentProps = {
  collapsed: boolean;
  homeHref?: string;
  navItems: AppNavItem[];
  navBadges?: Partial<Record<string, string>>;
  onLogout: () => void;
  onNavigate?: () => void;
  pathname: string;
  isLoading?: boolean;
};

export function ShellSidebarContent({
  collapsed,
  homeHref = "/",
  navItems,
  navBadges = {},
  onLogout,
  onNavigate,
  pathname,
  isLoading = false,
}: ShellSidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 px-3 py-4">
        <WokkiSidebarBrand collapsed={collapsed} href={homeHref} />
        <BranchSwitcher collapsed={collapsed} />
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

          return (
            <SidebarNavLink
              key={item.navKey}
              badge={navBadges[item.navKey] ?? null}
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

      <div className={cn("p-3", collapsed && "flex flex-col items-center")}>
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
          <LogOutIcon className="size-4 shrink-0" />
          {!collapsed ? <span>Đăng xuất</span> : <span className="sr-only">Đăng xuất</span>}
        </Button>
      </div>
    </div>
  );
}
