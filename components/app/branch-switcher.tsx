"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronsUpDownIcon, MapPinIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceLocations } from "@/hooks/useWorkspaceLocations";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import { useAuth } from "@/hooks/useAuth";
import { buildOrgScopedPath } from "@/lib/support/routing/tenant-routes";
import { ROLE_ADMIN, ROLE_MANAGER } from "@/lib/types/roles";
import { cn } from "@/lib/utils";

type BranchSwitcherProps = {
  collapsed?: boolean;
};

export function BranchSwitcher({ collapsed = false }: BranchSwitcherProps) {
  const { orgId, locationId, switchBranch, orgPath } = useTenantNavigation();
  const { session } = useFoundationSession();
  const { role } = useAuth();
  const isManagerScope = role === ROLE_MANAGER;
  const { data: locations = [] } = useWorkspaceLocations(isManagerScope);

  const effectiveLocationId = locationId ?? session.selectedLocationId;

  const activeLocation = useMemo(
    () => locations.find((l) => l.id === effectiveLocationId) ?? null,
    [locations, effectiveLocationId]
  );

  const canCreate = role === ROLE_ADMIN;

  if (!orgId || (role !== ROLE_ADMIN && role !== ROLE_MANAGER)) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-auto min-w-0 flex-1 justify-start gap-2 rounded-xl px-2 py-2",
              collapsed && "size-10 flex-none justify-center px-0"
            )}
            aria-label="Chọn chi nhánh"
          />
        }
      >
        <MapPinIcon className="size-4 shrink-0 text-[#4C88C6]" />
        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold">
              {activeLocation?.name ?? "Chọn chi nhánh"}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Chi nhánh</DropdownMenuLabel>
          {locations.length === 0 ? (
            <DropdownMenuItem disabled>Chưa có chi nhánh</DropdownMenuItem>
          ) : (
            locations.map((loc) => (
              <DropdownMenuItem
                key={loc.id}
                onClick={() => switchBranch(loc.id)}
                className={loc.id === effectiveLocationId ? "bg-accent" : undefined}
              >
                {loc.name}
                {!loc.isActive ? " (ngưng)" : ""}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        {canCreate ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link
                    href={orgPath("onboarding", ROLE_ADMIN)}
                    className="flex w-full items-center gap-2"
                  />
                }
              >
                <PlusIcon className="size-4" />
                Tạo chi nhánh
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
