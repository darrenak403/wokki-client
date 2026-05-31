"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type WokkiSidebarBrandProps = {
  collapsed?: boolean;
  href?: string;
};

export function WokkiSidebarBrand({ collapsed = false, href = "/" }: WokkiSidebarBrandProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-xl transition-opacity hover:opacity-90",
        collapsed && "justify-center"
      )}
      aria-label="Wokki"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#102854] via-[#4C88C6] to-[#1D4D8F] text-sm font-black text-white">
        W
      </span>
      {!collapsed ? (
        <span className="truncate text-lg font-extrabold tracking-tight text-neutral-950 dark:text-white">
          Wokki
        </span>
      ) : (
        <span className="sr-only">Wokki</span>
      )}
    </Link>
  );
}
