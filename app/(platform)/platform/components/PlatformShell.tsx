"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  Building2Icon,
  FileClockIcon,
  HeartPulseIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PlatformDashboardPanel } from "@/app/(platform)/platform/components/PlatformDashboardPanel";
import { PlatformHealthPanel } from "@/app/(platform)/platform/components/PlatformHealthPanel";
import { PlatformOrganizationsPanel } from "@/app/(platform)/platform/components/PlatformOrganizationsPanel";
import { PlatformOverviewWidgets } from "@/app/(platform)/platform/components/PlatformOverviewWidgets";
import { PlatformSubscriptionLedgerPanel } from "@/app/(platform)/platform/components/PlatformSubscriptionLedgerPanel";
import { PlatformSupportPanel } from "@/app/(platform)/platform/components/PlatformSupportPanel";
import { PlatformUsageAnalyticsPanel } from "@/app/(platform)/platform/components/PlatformUsageAnalyticsPanel";
import { PlatformAuthGuard } from "@/components/shared/platform-auth-guard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PlatformOrganizationResponse } from "@/types/platform";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();

  return (
    <PlatformAuthGuard>
    <div className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <header className="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800 md:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <Link href="/platform" className="text-lg font-semibold tracking-tight">
              Wokki Platform
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {user?.email ? (
              <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={() => void logout()}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
    </PlatformAuthGuard>
  );
}

export function PlatformHome() {
  const [tab, setTab] = useState("overview");
  const [ledgerOrg, setLedgerOrg] = useState<PlatformOrganizationResponse | null>(null);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6">
      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-9">
            <TabsTrigger value="overview">
              <LayoutDashboardIcon className="size-4" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="organizations">
              <Building2Icon className="size-4" />
              Tổ chức
            </TabsTrigger>
            <TabsTrigger value="ledger">
              <FileClockIcon className="size-4" />
              Ledger gói
            </TabsTrigger>
            <TabsTrigger value="support">
              <LifeBuoyIcon className="size-4" />
              Support
            </TabsTrigger>
            <TabsTrigger value="health">
              <HeartPulseIcon className="size-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="usage">
              <ActivityIcon className="size-4" />
              Usage
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {tab === "overview" ? (
            <>
              <div>
                <h2 className="text-lg font-semibold">Tổng quan</h2>
                <p className="text-sm text-muted-foreground">
                  Thống kê toàn hệ thống, việc cần chú ý và xu hướng hoạt động của các tổ chức.
                </p>
              </div>
              <PlatformDashboardPanel />
              <PlatformOverviewWidgets />
              <PlatformOrganizationsPanel
                onOpenLedger={(org) => {
                  setLedgerOrg(org);
                  setTab("ledger");
                }}
              />
            </>
          ) : null}
        </TabsContent>
        <TabsContent value="organizations">
          {tab === "organizations" ? (
            <PlatformOrganizationsPanel
              onOpenLedger={(org) => {
                setLedgerOrg(org);
                setTab("ledger");
              }}
            />
          ) : null}
        </TabsContent>
        <TabsContent value="ledger">
          {tab === "ledger" ? (
            <PlatformSubscriptionLedgerPanel
              scopedOrganization={ledgerOrg}
              onClearScopedOrganization={() => setLedgerOrg(null)}
            />
          ) : null}
        </TabsContent>
        <TabsContent value="support">
          {tab === "support" ? <PlatformSupportPanel /> : null}
        </TabsContent>
        <TabsContent value="health">
          {tab === "health" ? <PlatformHealthPanel /> : null}
        </TabsContent>
        <TabsContent value="usage">
          {tab === "usage" ? <PlatformUsageAnalyticsPanel /> : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
