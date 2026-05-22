"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAppHomePath } from "@/lib/auth/app-routes";
import { normalizeAppRole } from "@/lib/auth/normalize-role";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SITE_NAV } from "@/components/shared/site-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated, role } = useAuth();
  const normalizedRole = normalizeAppRole(role);
  const appHome = normalizedRole ? getAppHomePath(normalizedRole) : "/login";
  const showAppEntry = isAuthenticated && Boolean(normalizedRole);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6 md:px-10">
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight text-foreground">
          Wokki
        </Link>

        <nav
          className="hidden items-center gap-1 overflow-x-auto sm:flex"
          aria-label="Điều hướng chính"
        >
          {SITE_NAV.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {showAppEntry ? (
            <Link href={appHome} className={cn(buttonVariants({ size: "sm" }))}>
              Vào ứng dụng
            </Link>
          ) : (
            <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
