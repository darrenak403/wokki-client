"use client";

import Link from "next/link";
import type { AppNavItem } from "@/components/app/app-nav";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { renderNavIcon } from "./app-shell-utils";

export type SidebarNavLinkProps = {
  badge: string | null;
  collapsed: boolean;
  href: string;
  item: AppNavItem;
  isActive: boolean;
  label: string;
  onNavigate?: () => void;
};

export function SidebarNavLink({
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
