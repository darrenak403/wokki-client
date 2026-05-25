"use client";

import { useEffect, useMemo, useState } from "react";
import { InfoIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useLocationSchedulingPolicyQuery,
  useUpdateLocationSchedulingPolicyMutation,
} from "@/hooks/useLocations";
import {
  CATEGORY_SECTION_HINTS,
  countRequiredProgress,
  createCustomRule,
  CUSTOM_RULES_SECTION,
  filterRules,
  getCustomRules,
  getValueUnit,
  getVisibleCategories,
  groupRulesByCategory,
  isCustomRule,
  LOCATION_SCHEDULING_POLICY_SCHEMA,
  patchRule,
  patchRuleValue,
  prepareRulesForSave,
  removeRule,
  RULE_CATEGORY_NAV,
  type RuleCategoryId,
  VALUE_TYPE_LABELS,
} from "@/lib/support/schedule/location-scheduling-rules";
import type { LocationResponse, LocationSchedulingRule } from "@/types/foundation";
import { PolicyRuleRow } from "./PolicyRuleRow";
import { CustomRuleRow } from "./CustomRuleRow";

type LocationPolicyDialogProps = {
  location: LocationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
};

export function LocationPolicyDialog({
  location,
  open,
  onOpenChange,
  canWrite,
}: LocationPolicyDialogProps) {
  const locationId = location?.id ?? null;
  const { data: policy, isLoading } = useLocationSchedulingPolicyQuery(locationId, open);
  const updatePolicy = useUpdateLocationSchedulingPolicyMutation(locationId ?? "");
  const serverRules = policy?.rules ?? [];
  const [editedRules, setEditedRules] = useState<LocationSchedulingRule[] | null>(null);
  const rules = editedRules ?? serverRules;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<RuleCategoryId>("preferenceRules");

  const rulesByCategory = useMemo(() => groupRulesByCategory(rules), [rules]);
  const visibleCategories = useMemo(() => getVisibleCategories(rulesByCategory), [rulesByCategory]);
  const requiredProgress = useMemo(() => countRequiredProgress(rules), [rules]);

  const displayedRules = useMemo(() => {
    const q = searchQuery.trim();
    if (q) return filterRules(rules, q);
    return rulesByCategory.get(activeCategory) ?? [];
  }, [activeCategory, rules, rulesByCategory, searchQuery]);

  const mutateRules = (
    updater: (current: LocationSchedulingRule[]) => LocationSchedulingRule[],
  ) => {
    setEditedRules((current) => updater(current ?? serverRules));
  };

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setEditedRules(null);
      return;
    }
    setEditedRules(null);
  }, [open, policy?.updatedAt]);

  useEffect(() => {
    if (visibleCategories.length === 0) return;
    if (!visibleCategories.includes(activeCategory)) {
      setActiveCategory(visibleCategories[0]!);
    }
  }, [activeCategory, visibleCategories]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEditedRules(null);
      setSearchQuery("");
    }
    onOpenChange(next);
  };

  const saveRules = async () => {
    if (!locationId || !canWrite) return;
    await updatePolicy.mutateAsync({
      schemaVersion: policy?.schemaVersion ?? LOCATION_SCHEDULING_POLICY_SCHEMA,
      rules: prepareRulesForSave(rules),
    });
    setEditedRules(null);
  };

  const addCustomRule = () => {
    mutateRules((current) => [...current, createCustomRule(getCustomRules(current).length)]);
    setActiveCategory("customRules");
    setSearchQuery("");
  };

  const progressPercent =
    requiredProgress.total === 0
      ? 100
      : Math.round((requiredProgress.completed / requiredProgress.total) * 100);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 ring-0 sm:max-w-none">
        <DialogHeader className="shrink-0 space-y-3 border-b px-5 py-4 pr-12 sm:px-6 lg:space-y-0">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="min-w-0 space-y-0.5">
              <DialogTitle className="text-lg font-semibold">Luật chi nhánh</DialogTitle>
              {location ? (
                <p className="text-sm font-medium text-muted-foreground">{location.name}</p>
              ) : null}
            </div>
            <div className="relative w-full lg:max-w-sm lg:shrink-0">
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

        <div className="shrink-0 border-b px-6 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="flex items-start gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-brand-medium" aria-hidden />
              <span>
                Chỉ các mục dưới đây được solver đọc khi gợi ý lịch. Công bằng, điểm thưởng và trần
                ca/tuần do hệ thống quy định (không cấu hình theo phòng ban).
              </span>
            </p>
            <div className="w-full shrink-0 space-y-1.5 lg:w-48">
              <p className="text-xs font-medium text-foreground lg:text-right">
                Đã hoàn tất: {requiredProgress.completed}/{requiredProgress.total} Bắt buộc
              </p>
              <div
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tiến độ luật bắt buộc"
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-emerald-600 transition-[width] duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Đang tải…
          </p>
        ) : (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {!searchQuery.trim() ? (
              <nav
                className="hidden w-48 shrink-0 overflow-y-auto border-r bg-muted/20 py-2 md:block lg:w-52"
                aria-label="Nhóm luật"
              >
                {RULE_CATEGORY_NAV.filter((item) =>
                  visibleCategories.includes(item.id),
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveCategory(item.id)}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm transition-colors",
                      activeCategory === item.id
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
              {!searchQuery.trim() ? (
                <div className="mb-3 md:hidden">
                  <Select
                    value={activeCategory}
                    onValueChange={(value) => setActiveCategory(value as RuleCategoryId)}
                  >
                    <SelectTrigger aria-label="Nhóm luật">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_CATEGORY_NAV.filter((item) =>
                        visibleCategories.includes(item.id),
                      ).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {!searchQuery.trim() && CATEGORY_SECTION_HINTS[activeCategory] ? (
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  {CATEGORY_SECTION_HINTS[activeCategory]}
                </p>
              ) : null}

              {searchQuery.trim() ? (
                <p className="py-2 text-xs text-muted-foreground">
                  {displayedRules.length} kết quả trong toàn bộ luật
                </p>
              ) : activeCategory === "customRules" && displayedRules.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">{CUSTOM_RULES_SECTION.description}</p>
                  {canWrite ? (
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={addCustomRule}>
                      <PlusIcon className="size-4" />
                      Thêm luật riêng
                    </Button>
                  ) : null}
                </div>
              ) : null}

              <ul className="divide-y">
                {displayedRules.map((rule) =>
                  isCustomRule(rule) ? (
                    <CustomRuleRow
                      key={rule.key}
                      rule={rule}
                      canWrite={canWrite}
                      showCategoryTag={Boolean(searchQuery.trim())}
                      onUpdate={(patch) =>
                        mutateRules((current) => patchRule(current, rule.key, patch))
                      }
                      onRemove={() => mutateRules((current) => removeRule(current, rule.key))}
                    />
                  ) : (
                    <PolicyRuleRow
                      key={rule.key}
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
                  ),
                )}
              </ul>

              {displayedRules.length === 0 && searchQuery.trim() ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Không tìm thấy luật phù hợp.
                </p>
              ) : null}
            </div>
          </div>
        )}

        <DialogFooter className="m-0 shrink-0 gap-2 rounded-none border-t bg-background px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Đóng
          </Button>
          {canWrite ? (
            <Button
              data-save
              type="button"
              disabled={updatePolicy.isPending || isLoading}
              onClick={() => void saveRules()}
            >
              {updatePolicy.isPending ? "Đang lưu…" : "Lưu luật"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

