"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircleIcon, InfoIcon, PlusIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useOrgSchedulingPolicyQuery,
  useSchedulingRuleCatalogQuery,
  useUpdateOrgSchedulingPolicyMutation,
} from "@/hooks/useOrgSchedulingPolicy";
import {
  createAdvisoryRule,
  CUSTOM_RULES_SECTION,
  filterRules,
  getAdvisoryRules,
  getCategoryHint,
  getCategoryNavWithCounts,
  groupRulesByCategory,
  isAdvisoryRule,
  MAX_ADVISORY_RULES,
  mergeEffectiveRules,
  ORG_SCHEDULING_POLICY_SCHEMA,
  patchRule,
  patchRuleValue,
  prepareRulesForSave,
  removeRule,
} from "@/lib/support/schedule/org-scheduling-rules";
import type { SchedulingRule } from "@/types/foundation";
import { SETTINGS_PAIR_HEIGHT_CLASS } from "@/components/auth/account-settings-pair-layout";
import { PolicyRuleRow } from "./PolicyRuleRow";
import { CustomRuleRow } from "./CustomRuleRow";

type OrgSchedulingPolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
};

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C88C6]/50 focus-visible:ring-offset-1",
        active
          ? "border-[#1D4D8F] bg-[#1D4D8F] text-white shadow-sm"
          : "border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
      )}
    >
      {label}
      {count > 0 ? (
        <span
          className={cn(
            "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
            active ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function OrgSchedulingPolicyDialog({
  open,
  onOpenChange,
  canWrite,
}: OrgSchedulingPolicyDialogProps) {
  const catalogQuery = useSchedulingRuleCatalogQuery(open);
  const policyQuery = useOrgSchedulingPolicyQuery(open);
  const updatePolicy = useUpdateOrgSchedulingPolicyMutation();

  const baseRules = useMemo(
    () => mergeEffectiveRules(catalogQuery.data, policyQuery.data?.rules),
    [catalogQuery.data, policyQuery.data?.rules],
  );

  const [editedRules, setEditedRules] = useState<SchedulingRule[] | null>(null);
  const rules = editedRules ?? baseRules;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("preferenceRules");

  const categoryNav = useMemo(
    () => getCategoryNavWithCounts(rules, catalogQuery.data),
    [rules, catalogQuery.data],
  );

  const rulesByCategory = useMemo(
    () => groupRulesByCategory(rules, categoryNav.map((item) => item.id)),
    [rules, categoryNav],
  );

  const isLoading = catalogQuery.isLoading || policyQuery.isLoading;
  const loadError = catalogQuery.isError || policyQuery.isError;

  const displayedRules = useMemo(() => {
    const q = searchQuery.trim();
    if (q) return filterRules(rules, q, catalogQuery.data);
    return rulesByCategory.get(activeCategory) ?? [];
  }, [activeCategory, catalogQuery.data, rules, rulesByCategory, searchQuery]);

  const advisoryCount = getAdvisoryRules(rules).length;
  const isCustomSection = activeCategory === "customRules";

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setEditedRules(null);
      return;
    }
    setEditedRules(null);
  }, [open, policyQuery.data?.updatedAt]);

  useEffect(() => {
    if (categoryNav.length === 0) return;
    if (!categoryNav.some((item) => item.id === activeCategory)) {
      setActiveCategory(categoryNav[0]!.id);
    }
  }, [activeCategory, categoryNav]);

  const mutateRules = (updater: (current: SchedulingRule[]) => SchedulingRule[]) => {
    setEditedRules((current) => updater(current ?? baseRules));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEditedRules(null);
      setSearchQuery("");
    }
    onOpenChange(next);
  };

  const saveRules = async () => {
    if (!canWrite) return;
    await updatePolicy.mutateAsync({
      schemaVersion: policyQuery.data?.schemaVersion ?? ORG_SCHEDULING_POLICY_SCHEMA,
      rules: prepareRulesForSave(rules),
    });
    setEditedRules(null);
  };

  const addAdvisoryRule = () => {
    if (advisoryCount >= MAX_ADVISORY_RULES) return;
    mutateRules((current) => [...current, createAdvisoryRule(advisoryCount)]);
    setActiveCategory("customRules");
    setSearchQuery("");
  };

  const retryLoad = () => {
    void catalogQuery.refetch();
    void policyQuery.refetch();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex w-[min(920px,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none",
          SETTINGS_PAIR_HEIGHT_CLASS,
        )}
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4 pr-12 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-lg font-semibold">Luật xếp lịch tổ chức</DialogTitle>
                {!canWrite ? (
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    Chỉ xem
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                Một bộ luật cho toàn bộ chi nhánh · Áp dụng khi Manager gợi ý lịch
              </p>
            </div>
            <div className="relative w-full lg:max-w-xs lg:shrink-0">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm kiếm luật…"
                className="h-9 bg-background pl-9"
                aria-label="Tìm kiếm luật"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="shrink-0 space-y-3 border-b bg-muted/20 px-5 py-3 sm:px-6">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-brand-medium" aria-hidden />
            <span>
              Luật <strong className="font-medium text-foreground">bật</strong> được solver áp dụng khi
              gợi ý lịch.{" "}
              <strong className="font-medium text-foreground">Ghi chú</strong> — nội bộ, tối đa{" "}
              {MAX_ADVISORY_RULES}/org (tự thêm/xóa).
            </span>
          </p>

          {!searchQuery.trim() && categoryNav.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categoryNav.map((item) => (
                <CategoryChip
                  key={item.id}
                  label={item.label}
                  count={item.count}
                  active={activeCategory === item.id}
                  onClick={() => setActiveCategory(item.id)}
                />
              ))}
            </div>
          ) : null}

          {isCustomSection && canWrite ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed bg-background px-3 py-2">
              <p className="text-sm text-muted-foreground">
                {CUSTOM_RULES_SECTION.description} ({advisoryCount}/{MAX_ADVISORY_RULES})
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={advisoryCount >= MAX_ADVISORY_RULES}
                onClick={addAdvisoryRule}
              >
                <PlusIcon className="size-4" />
                Thêm luật ghi chú
              </Button>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {isLoading ? (
            <div className="space-y-3 py-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <AlertCircleIcon className="size-10 text-destructive" aria-hidden />
              <div className="space-y-1">
                <p className="font-medium">Không tải được luật xếp lịch</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Kiểm tra kết nối API hoặc thử tải lại. Cần quyền Admin/Manager trong org.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={retryLoad}>
                <RefreshCwIcon className="size-4" />
                Thử lại
              </Button>
            </div>
          ) : (
            <>
              {!searchQuery.trim() && getCategoryHint(activeCategory, catalogQuery.data) ? (
                <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                  {getCategoryHint(activeCategory, catalogQuery.data)}
                </p>
              ) : null}

              {searchQuery.trim() ? (
                <p className="mb-3 text-xs text-muted-foreground">
                  {displayedRules.length} kết quả
                </p>
              ) : null}

              {displayedRules.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isCustomSection
                      ? "Chưa có luật ghi chú. Thêm ghi chú nội bộ cho tổ chức."
                      : "Không có luật trong nhóm này."}
                  </p>
                  {isCustomSection && canWrite ? (
                    <Button type="button" variant="outline" onClick={addAdvisoryRule}>
                      <PlusIcon className="size-4" />
                      Thêm luật ghi chú
                    </Button>
                  ) : null}
                </div>
              ) : (
                <ul className="space-y-3">
                  {displayedRules.map((rule) => (
                    <li
                      key={rule.key}
                      className="rounded-xl border bg-card px-4 shadow-sm"
                    >
                      {isAdvisoryRule(rule) ? (
                        <CustomRuleRow
                          rule={rule}
                          canWrite={canWrite}
                          showCategoryTag={Boolean(searchQuery.trim())}
                          onUpdate={(patch) =>
                            mutateRules((current) => patchRule(current, rule.key, patch))
                          }
                          onRemove={() =>
                            mutateRules((current) => removeRule(current, rule.key))
                          }
                        />
                      ) : (
                        <PolicyRuleRow
                          rule={rule}
                          canWrite={canWrite}
                          showCategoryTag={Boolean(searchQuery.trim())}
                          onUpdate={(patch) =>
                            mutateRules((current) => patchRule(current, rule.key, patch))
                          }
                          onValueChange={(value) =>
                            mutateRules((current) => patchRuleValue(current, rule.key, value))
                          }
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <DialogFooter className="m-0 shrink-0 justify-end gap-2 rounded-b-xl border-t bg-background px-5 py-4 sm:flex-row sm:px-6">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Đóng
          </Button>
          {canWrite ? (
            <Button
              type="button"
              disabled={updatePolicy.isPending || isLoading || loadError}
              onClick={() => void saveRules()}
            >
              {updatePolicy.isPending ? "Đang lưu…" : "Lưu thay đổi"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
