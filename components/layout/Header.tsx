"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useMobile";
import { getAppHomePath } from "@/lib/support/auth/app-routes";
import { normalizeAppRole } from "@/lib/support/auth/normalize-role";
import { ChainThemeToggle } from "@/components/ui/chain-theme-toggle";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { SITE_NAV } from "@/components/shared/site-nav";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavBody,
  NavItems,
} from "@/components/ui/resizable-navbar";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isAuthenticated, role } = useAuth();

  const normalizedRole = normalizeAppRole(role);
  const appHome = normalizedRole ? getAppHomePath(normalizedRole) : "/login";
  const showAppEntry = isAuthenticated && Boolean(normalizedRole);

  useEffect(() => {
    if (!isMobile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="sticky top-0 z-50 w-full">
      <Navbar>
        <NavBody>
          <HeaderLogo />

          <NavItems
            items={SITE_NAV.map((item) => ({ name: item.label, link: item.href }))}
            activeHref={pathname}
          />

          <div className="relative z-20 flex items-center gap-4">
            <div className="relative">
              <Link href={showAppEntry ? appHome : "/login"}>
                <InteractiveHoverButton variant="dark" className="text-sm font-bold">
                  {showAppEntry ? "Vào ứng dụng" : "Đăng nhập"}
                </InteractiveHoverButton>
              </Link>
              <div className="pointer-events-auto absolute left-1/2 top-full z-40 flex -translate-x-1/2 flex-col items-center">
                <ChainThemeToggle />
              </div>
            </div>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <HeaderLogo />
            <div className="flex items-center gap-2">
              <Link href={showAppEntry ? appHome : "/login"}>
                <InteractiveHoverButton variant="dark" className="px-3 py-1 text-xs font-bold">
                  {showAppEntry ? "Vào app" : "Đăng nhập"}
                </InteractiveHoverButton>
              </Link>
              <div className="relative">
                <MobileNavToggle
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen((open) => !open)}
                />
                <div className="pointer-events-auto absolute left-1/2 top-full z-[60] flex -translate-x-1/2 flex-col items-center">
                  <ChainThemeToggle />
                </div>
              </div>
            </div>
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {SITE_NAV.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  className={`relative cursor-pointer text-sm font-medium ${
                    isActive
                      ? "text-neutral-950 dark:text-white"
                      : "text-neutral-600 dark:text-neutral-300"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="block">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href={showAppEntry ? appHome : "/login"}
              onClick={() => {
                  setIsMobileMenuOpen(false);
              }}
              className="rounded-xl bg-neutral-950 px-4 py-2 text-center text-sm font-semibold text-white dark:bg-white dark:text-neutral-950"
            >
              {showAppEntry ? "Vào ứng dụng" : "Đăng nhập"}
            </Link>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}

function HeaderLogo() {
  return (
    <Link href="/" className="relative z-20 flex items-center gap-1.5 px-2 py-1">
      <Image
        src="/WOKKI-LOGO.png"
        alt="Wokki"
        width={90}
        height={32}
        className="h-8 w-auto object-contain"
        style={{ width: "auto" }}
        priority
      />
      <span className="text-xl font-extrabold tracking-tight text-black dark:text-white">
        Wokki
      </span>
    </Link>
  );
}
