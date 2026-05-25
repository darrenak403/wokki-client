"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeftIcon, MenuIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAppNavForRole } from "@/components/app/app-nav";
import { useSwapInboxPendingCount } from "@/hooks/useSwapInboxPendingCount";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { renderNavIcon, getInitials } from "./app-shell-utils";
import { ShellSidebarContent } from "./app-shell-sidebar";
import { OrgTreeSidebar } from "./org-tree-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, role, logout, isLoading } = useAuth();
  const navItems = role ? getAppNavForRole(role) : [];
  const swapPendingCount = useSwapInboxPendingCount();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdminRoute = pathname.startsWith("/admin");

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
  const activeItem =
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
            isLoading={isLoading}
            navItems={navItems}
            onLogout={logout}
            pathname={pathname}
            role={role}
            swapPendingCount={swapPendingCount}
            userEmail={user?.email}
          />
        </aside>

        {/* Left sidebar handle tab */}
        <button
          type="button"
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
        </button>

        {/* Right org tree sidebar — always visible on admin routes */}
        {isAdminRoute && (
          <aside className="fixed inset-y-0 right-0 z-40 hidden w-72 overflow-hidden border-l border-neutral-200 bg-white/90 backdrop-blur-xl lg:flex lg:flex-col dark:border-neutral-800 dark:bg-neutral-900/90">
            <OrgTreeSidebar />
          </aside>
        )}

        <div
          className={cn(
            "transition-[padding] duration-300 lg:pl-72",
            collapsed && "lg:pl-20",
            isAdminRoute && "lg:pr-72"
          )}
        >
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
