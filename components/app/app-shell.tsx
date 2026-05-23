"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  BadgeDollarSignIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CalendarClockIcon,
  CalendarDaysIcon,
  Clock3Icon,
  LayoutDashboardIcon,
  LogOutIcon,
  MapPinIcon,
  MenuIcon,
  MessageCircleIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  Repeat2Icon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAppNavForRole, type AppNavItem } from "@/components/app/app-nav";
import { useSwapInboxPendingCount } from "@/hooks/useSwapInboxPendingCount";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function renderNavIcon(item: AppNavItem | undefined, className = "size-4 shrink-0") {
  if (!item) return <LayoutDashboardIcon className={className} />;

  const label = item.label.toLowerCase();

  if (label.includes("dashboard")) return <LayoutDashboardIcon className={className} />;
  if (label.includes("chi nhánh")) return <MapPinIcon className={className} />;
  if (label.includes("phòng ban")) return <Building2Icon className={className} />;
  if (label.includes("ca làm")) return <Clock3Icon className={className} />;
  if (label.includes("nhân sự")) return <UsersIcon className={className} />;
  if (label.includes("tài khoản")) return <UserCogIcon className={className} />;
  if (label.includes("lịch")) return <CalendarDaysIcon className={className} />;
  if (label.includes("đổi ca")) return <Repeat2Icon className={className} />;
  if (label.includes("chấm công")) return <Clock3Icon className={className} />;
  if (label.includes("lương")) return <BadgeDollarSignIcon className={className} />;
  if (label.includes("tin nhắn")) return <MessageCircleIcon className={className} />;

  switch (item.module) {
    case "wave2":
      return <BriefcaseBusinessIcon className={className} />;
    case "wave3":
      return <CalendarClockIcon className={className} />;
    case "wave4":
      return <CalendarDaysIcon className={className} />;
    case "wave5":
      return <Repeat2Icon className={className} />;
    case "wave6":
      return <MessageCircleIcon className={className} />;
    case "core":
    default:
      return <LayoutDashboardIcon className={className} />;
  }
}

function getInitials(email?: string) {
  if (!email) return "W";
  return email.slice(0, 2).toUpperCase();
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, role, logout, isLoading } = useAuth();
  const navItems = role ? getAppNavForRole(role) : [];
  const swapPendingCount = useSwapInboxPendingCount();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const homeHref = navItems[0]?.href ?? "/";
  const activeItem =
    navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    navItems[0];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-neutral-200 bg-white/90 backdrop-blur-xl transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex lg:flex-col dark:border-neutral-800 dark:bg-neutral-900/90",
            collapsed ? "w-20" : "w-72"
          )}
        >
          <ShellSidebarContent
            collapsed={collapsed}
            homeHref={homeHref}
            isLoading={isLoading}
            navItems={navItems}
            onLogout={logout}
            pathname={pathname}
            role={role}
            swapPendingCount={swapPendingCount}
            userEmail={user?.email}
          />
        </aside>

        <div className={cn("transition-[padding] duration-300 lg:pl-72", collapsed && "lg:pl-20")}>
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-neutral-200 bg-white/85 px-4 backdrop-blur-xl md:px-6 lg:px-8 dark:border-neutral-800 dark:bg-neutral-900/85">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger
                  render={<Button variant="outline" size="icon" className="lg:hidden" />}
                >
                  <MenuIcon />
                  <span className="sr-only">Mở menu</span>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0" showCloseButton={false}>
                  <SheetHeader className="sr-only">
                    <SheetTitle>Điều hướng ứng dụng</SheetTitle>
                  </SheetHeader>
                  <ShellSidebarContent
                    collapsed={false}
                    homeHref={homeHref}
                    isLoading={isLoading}
                    navItems={navItems}
                    onLogout={logout}
                    onNavigate={() => setMobileOpen(false)}
                    pathname={pathname}
                    role={role}
                    swapPendingCount={swapPendingCount}
                    userEmail={user?.email}
                  />
                </SheetContent>
              </Sheet>

              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={() => setCollapsed((value) => !value)}
                className="hidden rounded-2xl bg-white shadow-lg shadow-neutral-900/10 lg:inline-flex dark:bg-neutral-900"
              >
                {collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
                <span className="sr-only">{collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}</span>
              </Button>

              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden size-10 items-center justify-center rounded-2xl bg-[#EEF6FB] text-[#1D4D8F] ring-1 ring-[#BCE8F5] sm:flex dark:bg-[#0B1E3D] dark:text-[#BCE8F5] dark:ring-[#4C88C6]/40">
                  {renderNavIcon(activeItem, "size-5")}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-extrabold tracking-tight text-neutral-950 md:text-2xl dark:text-white">
                    {activeItem?.label ?? "Dashboard"}
                  </h1>
                  <p className="mt-0.5 hidden truncate text-sm text-neutral-500 md:block dark:text-neutral-400">
                    Khu làm việc dành cho {role?.toLowerCase() ?? "người dùng"} trong Wokki.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <ThemeToggle compact />
              <div className="hidden items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 md:flex dark:border-neutral-800 dark:bg-neutral-950">
                <Avatar
                  size="sm"
                  className="bg-[#EEF6FB] text-[#1D4D8F] dark:bg-[#0B1E3D] dark:text-[#BCE8F5]"
                >
                  <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                </Avatar>
                <span className="max-w-40 truncate text-sm font-semibold">
                  {user?.email ?? "Wokki user"}
                </span>
              </div>
            </div>
          </header>

          <main className="min-h-[calc(100vh-5rem)] p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

type ShellSidebarContentProps = {
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

function ShellSidebarContent({
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

type SidebarNavLinkProps = {
  badge: string | null;
  collapsed: boolean;
  href: string;
  item: AppNavItem;
  isActive: boolean;
  label: string;
  onNavigate?: () => void;
};

function SidebarNavLink({
  badge,
  collapsed,
  href,
  item,
  isActive,
  label,
  onNavigate,
}: SidebarNavLinkProps) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative flex h-11 items-center rounded-xl text-sm font-semibold transition-all",
        collapsed ? "w-11 justify-center" : "w-full justify-between px-3",
        isActive
          ? "bg-[#EEF6FB] text-[#102854] shadow-sm ring-1 ring-[#BCE8F5] dark:bg-[#0B1E3D] dark:text-[#BCE8F5] dark:ring-[#4C88C6]/40"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span className={cn("flex min-w-0 items-center gap-3", collapsed && "justify-center")}>
        {renderNavIcon(item, "size-4 shrink-0")}
        {!collapsed ? <span className="truncate">{label}</span> : null}
      </span>
      {badge ? (
        <span
          className={cn(
            "rounded-full bg-[#1D4D8F] px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums",
            collapsed && "absolute -right-1 -top-1"
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
