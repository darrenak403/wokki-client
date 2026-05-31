import type {
  SchedulingRule,
  SchedulingRuleCatalogCategory,
  SchedulingRuleCatalogResponse,
  SchedulingRuleValue,
} from "@/types/foundation";

export const ORG_SCHEDULING_POLICY_SCHEMA = "org-scheduling-policy.v1.1";
export const MAX_ADVISORY_RULES = 20;

export type RuleCategoryId = string;

export function buildCategoryNav(catalog?: SchedulingRuleCatalogResponse | null) {
  return (catalog?.categories ?? []).map((item) => ({
    id: item.id,
    label: item.label,
    hint: item.hint ?? undefined,
  }));
}

export function getCategoryLabel(
  categoryId: string,
  catalog?: SchedulingRuleCatalogResponse | null,
): string {
  return catalog?.categories.find((item) => item.id === categoryId)?.label ?? categoryId;
}

export function getCategoryHint(
  categoryId: string,
  catalog?: SchedulingRuleCatalogResponse | null,
): string | undefined {
  const hint = catalog?.categories.find((item) => item.id === categoryId)?.hint;
  return hint ?? undefined;
}

export function resolveRuleCategory(category: string): string {
  return category.trim() || "customRules";
}

export const CUSTOM_RULES_SECTION = {
  id: "customRules" as const,
  label: "Luật ghi chú",
  description: "Ghi chú nội bộ; solver không đọc luật advisory.",
};

export function groupRulesByCategory(
  rules: SchedulingRule[],
  categoryIds: string[],
): Map<string, SchedulingRule[]> {
  const map = new Map<string, SchedulingRule[]>();
  for (const id of categoryIds) {
    map.set(id, []);
  }
  const sorted = [...rules].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const rule of sorted) {
    const category = resolveRuleCategory(rule.category);
    if (!map.has(category)) map.set(category, []);
    map.get(category)!.push(rule);
  }
  return map;
}

export function mergeEffectiveRules(
  catalog: SchedulingRuleCatalogResponse | null | undefined,
  policyRules: SchedulingRule[] | null | undefined,
): SchedulingRule[] {
  if (!catalog?.rules?.length) return policyRules ?? [];

  const savedByKey = new Map(
    (policyRules ?? []).map((rule) => [rule.key.toLowerCase(), rule]),
  );

  const enforced = catalog.rules.map((entry) => {
    const saved = savedByKey.get(entry.key.toLowerCase());
    return {
      key: entry.key,
      category: entry.category,
      content: entry.content,
      inputLabel: entry.inputLabel,
      valueType: entry.valueType,
      value: saved?.value ?? entry.defaultValue,
      enabled: saved?.enabled ?? false,
      isDefault: true,
      isRequired: entry.isRequired,
      sortOrder: entry.sortOrder,
      enforcement: (entry.enforcement === "advisory" ? "advisory" : "enforced") as
        | "enforced"
        | "advisory",
    } satisfies SchedulingRule;
  });

  const catalogKeys = new Set(catalog.rules.map((r) => r.key.toLowerCase()));
  const advisory = (policyRules ?? [])
    .filter((rule) => !catalogKeys.has(rule.key.toLowerCase()))
    .map((rule) => ({
      ...rule,
      category: rule.category || "customRules",
      enforcement: "advisory" as const,
      isDefault: false,
    }));

  return [...enforced, ...advisory].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryNavWithCounts(
  rules: SchedulingRule[],
  catalog?: SchedulingRuleCatalogResponse | null,
) {
  const nav = buildCategoryNav(catalog);
  const grouped = groupRulesByCategory(
    rules,
    nav.map((item) => item.id),
  );
  return nav.map((item) => ({
    ...item,
    count: grouped.get(item.id)?.length ?? 0,
  }));
}

export function getVisibleCategories(
  rulesByCategory: Map<string, SchedulingRule[]>,
  categoryNav: Array<{ id: string }>,
): string[] {
  // Always show catalog categories so empty policy still renders enforced rules.
  if (categoryNav.length > 0) return categoryNav.map((item) => item.id);
  return [...rulesByCategory.entries()]
    .filter(([, items]) => items.length > 0)
    .map(([id]) => id);
}

export function filterRules(
  rules: SchedulingRule[],
  query: string,
  catalog?: SchedulingRuleCatalogResponse | null,
): SchedulingRule[] {
  const q = query.trim().toLowerCase();
  if (!q) return rules;
  return rules.filter((rule) => {
    const haystack = [
      rule.inputLabel,
      rule.content,
      rule.key,
      getCategoryLabel(rule.category, catalog),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function isRuleComplete(rule: SchedulingRule): boolean {
  if (!rule.isRequired) return true;
  if (rule.valueType === "boolean") return true;
  if (rule.valueType === "number") {
    const n = Number(rule.value);
    return rule.value !== null && Number.isFinite(n);
  }
  return String(rule.value ?? "").trim().length > 0;
}

export function countRequiredProgress(rules: SchedulingRule[]): {
  completed: number;
  total: number;
} {
  const required = rules.filter((r) => r.isRequired);
  const completed = required.filter(isRuleComplete).length;
  return { completed, total: required.length };
}

export function isAdvisoryRule(rule: SchedulingRule): boolean {
  return rule.enforcement === "advisory" || rule.category === "customRules";
}

export function getAdvisoryRules(rules: SchedulingRule[]): SchedulingRule[] {
  return rules.filter(isAdvisoryRule).sort((left, right) => left.sortOrder - right.sortOrder);
}

export function createAdvisoryRule(existingCount: number): SchedulingRule {
  return {
    key: `custom_${Date.now()}`,
    category: "customRules",
    content: "",
    inputLabel: "",
    valueType: "number",
    value: 0,
    enabled: true,
    isDefault: false,
    isRequired: false,
    sortOrder: 10_000 + existingCount,
    enforcement: "advisory",
  };
}

export function getValueUnit(rule: SchedulingRule): string | null {
  if (rule.valueType !== "number") return null;
  const label = rule.inputLabel.toLowerCase();
  const key = rule.key.toLowerCase();
  if (key.includes("rest") || key.includes("minute") || label.includes("phút")) return "phút";
  if (key.includes("hour") || label.includes("giờ")) return "giờ";
  if (key.includes("day") || label.includes("ngày")) return "ngày";
  if (key.includes("shift") || key.includes("_shifts") || label.includes("ca")) return "ca";
  if (label.includes("người")) return "người";
  return "";
}

export function normalizeRuleValue(
  value: SchedulingRuleValue,
  valueType: SchedulingRule["valueType"],
): SchedulingRuleValue {
  if (valueType === "number") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  if (valueType === "boolean") return Boolean(value);
  return value === null ? "" : String(value);
}

export function prepareRulesForSave(rules: SchedulingRule[]): SchedulingRule[] {
  return rules.map((rule, index) => ({
    ...rule,
    sortOrder: rule.sortOrder || index + 1,
    content: rule.content.trim(),
    inputLabel: rule.inputLabel.trim(),
    value: normalizeRuleValue(rule.value, rule.valueType),
  }));
}

export function patchRule(
  rules: SchedulingRule[],
  key: string,
  patch: Partial<SchedulingRule>,
): SchedulingRule[] {
  return rules.map((rule) => (rule.key === key ? { ...rule, ...patch } : rule));
}

export function patchRuleValue(
  rules: SchedulingRule[],
  key: string,
  value: SchedulingRuleValue,
): SchedulingRule[] {
  return patchRule(rules, key, { value, enabled: true });
}

export function removeRule(rules: SchedulingRule[], key: string): SchedulingRule[] {
  return rules.filter((rule) => rule.key !== key);
}

export const VALUE_TYPE_LABELS: Record<SchedulingRule["valueType"], string> = {
  text: "Ghi chú (chữ)",
  number: "Số",
  boolean: "Bật / tắt",
};

export function formatEnforcedRuleSummary(rule: SchedulingRule): string {
  if (rule.valueType === "boolean") {
    return `${rule.inputLabel}: ${rule.enabled && rule.value ? "Bật" : "Tắt"}`;
  }
  if (!rule.enabled) return `${rule.inputLabel}: Tắt`;
  const unit = getValueUnit(rule);
  return `${rule.inputLabel}: ${rule.value ?? "—"}${unit ? ` ${unit}` : ""}`;
}

export function getActiveEnforcedSummaries(rules: SchedulingRule[]): string[] {
  return rules
    .filter((rule) => rule.enforcement === "enforced" && rule.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(formatEnforcedRuleSummary);
}

export type CategoryNavItem = Pick<SchedulingRuleCatalogCategory, "id" | "label"> & {
  hint?: string;
};
