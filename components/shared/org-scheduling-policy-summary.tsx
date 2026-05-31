"use client";

import Link from "next/link";
import { ChevronRightIcon, SlidersHorizontalIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useOrgSchedulingPolicyQuery,
  useSchedulingRuleCatalogQuery,
} from "@/hooks/useOrgSchedulingPolicy";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import {
  getActiveEnforcedSummaries,
  mergeEffectiveRules,
} from "@/lib/support/schedule/org-scheduling-rules";
import { ROLE_ADMIN, ROLE_MANAGER } from "@/lib/types/roles";

type OrgSchedulingPolicySummaryProps = {
  canOpenFull?: boolean;
  orgPolicySettingsPath?: string;
};

export function OrgSchedulingPolicySummary({
  canOpenFull = false,
  orgPolicySettingsPath,
}: OrgSchedulingPolicySummaryProps) {
  const catalogQuery = useSchedulingRuleCatalogQuery(true);
  const policyQuery = useOrgSchedulingPolicyQuery(true);
  const { orgPath } = useTenantNavigation();
  const rules = mergeEffectiveRules(catalogQuery.data, policyQuery.data?.rules);
  const summaries = getActiveEnforcedSummaries(rules);
  const settingsHref =
    orgPolicySettingsPath ??
    orgPath("workspace", ROLE_ADMIN) ??
    orgPath("workspace", ROLE_MANAGER);

  return (
    <Collapsible defaultOpen className="rounded-lg border bg-muted/20">
      <CollapsibleTrigger
        className="flex h-auto w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-muted/40"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontalIcon className="size-4 text-brand-medium" aria-hidden />
          Luật org đang áp dụng
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 border-t px-4 py-3">
        {catalogQuery.isLoading || policyQuery.isLoading ? (
          <p className="text-xs text-muted-foreground">Đang tải luật tổ chức…</p>
        ) : summaries.length === 0 ? (
          <p className="text-xs text-muted-foreground">Chưa có luật enforced nào được bật.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {summaries.map((line) => (
              <li key={line}>
                <Badge variant="secondary" className="font-normal">
                  {line}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        {canOpenFull && settingsHref ? (
          <Link href={settingsHref} className="inline-flex text-xs text-primary hover:underline">
            Xem đầy đủ luật tổ chức
          </Link>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
