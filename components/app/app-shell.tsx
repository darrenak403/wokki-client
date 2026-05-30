"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeftIcon, MenuIcon, SettingsIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAppNavForRole, buildTenantNav } from "@/components/app/app-nav";
import { useTenantParams } from "@/hooks/useTenantParams";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectMustChangePassword, selectOrganizationId } from "@/lib/redux/slices/authSlice";
import { readFoundationSession } from "@/lib/support/foundation/session-context";
import { useSwapInboxPendingCount } from "@/hooks/useSwapInboxPendingCount";
import { AccountSettingsDialog } from "@/components/auth/account-settings-dialog";
import type { AccountSettingsSection } from "@/components/auth/account-settings-dialog";
import { TempAuthWarningBanner } from "@/components/auth/temp-auth-warning-banner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { renderNavIcon } from "./app-shell-utils";
import { ShellSidebarContent } from "./app-shell-sidebar";
import { FoundationScopePicker } from "@/components/shared/foundation-scope-picker";
import { SubscriptionRemainingWidget } from "@/components/app/subscription-remaining-widget";
import { HeaderWorkspaceScope } from "@/components/app/header-workspace-scope";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, role, logout, isLoading } = useAuth();
  const jwtOrgId = useAppSelector(selectOrganizationId);
  const mustChangePassword = useAppSelector(selectMustChangePassword);
  const { orgId: urlOrgId, locationId: urlLocationId, parsed } = useTenantParams();
  const sessionBranchId = readFoundationSession().selectedLocationId;
  const effectiveOrgId = urlOrgId ?? jwtOrgId ?? user?.organizationId ?? null;
  const effectiveLocationId = urlLocationId ?? sessionBranchId ?? null;
  const navItems =
    role && effectiveOrgId
      ? buildTenantNav(role, effectiveOrgId, effectiveLocationId)
      : [];
  const swapPendingCount = useSwapInboxPendingCount();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] =
    useState<AccountSettingsSection>("profile");
  const isAdminRoute = pathname.includes("/admin/") || pathname.startsWith("/admin");
  const isShiftsRoute = /\/(admin|manager)\/shifts(\/|$)/.test(pathname);
  const isWorkspaceRoute = Boolean(
    parsed?.featurePath === "workspace" || parsed?.featurePath.startsWith("workspace/")
  );

  const openAccountSettings = (section: AccountSettingsSection = "profile") => {
    setSettingsInitialSection(section);
    setSettingsOpen(true);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "s") return;
      e.preventDefault();
      const dialog = document.querySelector<HTMLElement>('[data-slot="dialog-content"]');
      if (!dialog) return;
      const form = dialog.querySelector("form");
      if (form) {
        form.requestSubmit();
        return;
      }
      dialog.querySelector<HTMLElement>("[data-save]")?.click();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const homeHref = navItems[0]?.href ?? "/";
  const activeFeature = parsed?.featurePath.split("/")[0];
  const activeItem =
    navItems.find((item) => item.navKey === activeFeature) ??
    navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    navItems[0];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        {/* Left sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-neutral-200 bg-white/90 backdrop-blur-xl transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex lg:flex-col dark:border-neutral-800 dark:bg-neutral-900/90",
            collapsed ? "w-20" : "w-60"
          )}
        >
          <ShellSidebarContent
            collapsed={collapsed}
            homeHref={homeHref}
            navItems={navItems}
            onLogout={logout}
            pathname={pathname}
            swapPendingCount={swapPendingCount}
            isLoading={isLoading}
          />
        </aside>

        {/* Left sidebar handle tab */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          className={cn(
            "fixed top-1/2 z-50 hidden h-10 w-4 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-neutral-200 bg-white/90 text-neutral-400 shadow-sm backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-neutral-700 lg:flex dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:text-neutral-200",
            collapsed ? "left-20" : "left-60"
          )}
        >
          <ChevronLeftIcon
            className={cn("size-3 transition-transform duration-500", collapsed && "rotate-180")}
          />
        </Button>

        <div className={cn("transition-[padding] duration-300 lg:pl-60", collapsed && "lg:pl-20")}>
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
                    navItems={navItems}
                    onLogout={logout}
                    onNavigate={() => setMobileOpen(false)}
                    pathname={pathname}
                    swapPendingCount={swapPendingCount}
                    isLoading={isLoading}
                  />
                </SheetContent>
              </Sheet>

              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden size-10 items-center justify-center rounded-2xl bg-[#EEF6FB] text-[#1D4D8F] ring-1 ring-[#BCE8F5] sm:flex dark:bg-[#0B1E3D] dark:text-[#BCE8F5] dark:ring-[#4C88C6]/40">
                  {renderNavIcon(activeItem, "size-5")}
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="shrink-0 text-xl font-extrabold tracking-tight text-neutral-950 md:text-2xl dark:text-white">
                    {activeItem?.label ?? "Dashboard"}
                  </h1>
                  <HeaderWorkspaceScope className="mt-0 min-w-0" />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <SubscriptionRemainingWidget variant="header" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 shrink-0"
                aria-label="Cài đặt tài khoản"
                onClick={() => openAccountSettings("profile")}
              >
                <SettingsIcon className="size-4" />
              </Button>
            </div>
          </header>

          {mustChangePassword ? (
            <TempAuthWarningBanner onChangePassword={() => openAccountSettings("security")} />
          ) : null}

          <AccountSettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            userEmail={user?.email}
            initialSection={settingsInitialSection}
            onLogout={logout}
          />

          <main
            className={cn(
              "min-h-[calc(100vh-5rem)]",
              isWorkspaceRoute ? "flex flex-col p-0" : "p-4 md:p-6 lg:p-8"
            )}
          >
            <div
              className={cn(
                isWorkspaceRoute
                  ? "flex min-h-0 flex-1 flex-col w-full"
                  : "mx-auto w-full max-w-7xl"
              )}
            >
              {isAdminRoute && !isWorkspaceRoute && !effectiveLocationId ? (
                <div className="mb-4">
                  <FoundationScopePicker />
                </div>
              ) : isAdminRoute && !isWorkspaceRoute && effectiveLocationId && !isShiftsRoute ? (
                <div className="mb-4">
                  <FoundationScopePicker hideLocationSelect />
                </div>
              ) : null}
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
