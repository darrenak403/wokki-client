import type { LocationSchedulingRule, LocationSchedulingRuleValue } from "@/types/foundation";

export const LOCATION_SCHEDULING_POLICY_SCHEMA = "location-scheduling-policy.v5";

/** Sidebar — minimal solver + workflow inputs (CP-SAT phase). */
export const RULE_CATEGORY_NAV = [
  { id: "preferenceRules", label: "Đăng ký ca" },
  { id: "coverageRules", label: "Coverage" },
  { id: "employeeEligibilityRules", label: "Vai trò" },
  { id: "workHourLimits", label: "Mục tiêu tuần" },
  { id: "restRules", label: "Nghỉ giữa ca" },
  { id: "customRules", label: "Luật riêng" },
] as const;

export type RuleCategoryId = (typeof RULE_CATEGORY_NAV)[number]["id"];

export const CATEGORY_SECTION_HINTS: Partial<Record<RuleCategoryId, string>> = {
  preferenceRules: "Preflight và chặn cứng trước khi solver chạy.",
  coverageRules: "Đủ người tối thiểu theo ca; chi tiết từng ca lấy từ định nghĩa ca.",
  employeeEligibilityRules: "Membership và nhân viên active luôn bật trong hệ thống.",
  workHourLimits:
    "Ca tối thiểu / tuần là mục tiêu mềm. Trần ca/tuần do hệ thống quy định (không cấu hình theo phòng ban).",
  restRules: "Khoảng nghỉ tối thiểu giữa hai ca (solver phase 1: overlap + rest).",
};

const LEGACY_CATEGORY_ALIASES: Record<string, RuleCategoryId> = {
  employeeLimits: "employeeEligibilityRules",
};

export function resolveRuleCategory(category: string): RuleCategoryId {
  if (RULE_CATEGORY_NAV.some((item) => item.id === category)) {
    return category as RuleCategoryId;
  }
  return LEGACY_CATEGORY_ALIASES[category] ?? "customRules";
}

export const CUSTOM_RULES_SECTION = {
  id: "customRules" as const,
  label: "Luật riêng",
  description: "Ghi chú nội bộ; solver hiện chưa đọc luật riêng tùy chỉnh.",
};

export function getCategoryLabel(categoryId: string): string {
  return RULE_CATEGORY_NAV.find((item) => item.id === categoryId)?.label ?? categoryId;
}

export function groupRulesByCategory(
  rules: LocationSchedulingRule[],
): Map<string, LocationSchedulingRule[]> {
  const map = new Map<string, LocationSchedulingRule[]>();
  for (const item of RULE_CATEGORY_NAV) {
    map.set(item.id, []);
  }
  const sorted = [...rules].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const rule of sorted) {
    const category = resolveRuleCategory(rule.category);
    map.get(category)!.push(rule);
  }
  return map;
}

export function getVisibleCategories(
  rulesByCategory: Map<string, LocationSchedulingRule[]>,
): RuleCategoryId[] {
  return RULE_CATEGORY_NAV.filter((item) => (rulesByCategory.get(item.id)?.length ?? 0) > 0).map(
    (item) => item.id,
  );
}

export function filterRules(
  rules: LocationSchedulingRule[],
  query: string,
): LocationSchedulingRule[] {
  const q = query.trim().toLowerCase();
  if (!q) return rules;
  return rules.filter((rule) => {
    const haystack = [rule.inputLabel, rule.content, rule.key, getCategoryLabel(rule.category)]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function isRuleComplete(rule: LocationSchedulingRule): boolean {
  if (!rule.isRequired) return true;
  if (rule.valueType === "boolean") return true;
  if (rule.valueType === "number") {
    const n = Number(rule.value);
    return rule.value !== null && Number.isFinite(n);
  }
  return String(rule.value ?? "").trim().length > 0;
}

export function countRequiredProgress(rules: LocationSchedulingRule[]): {
  completed: number;
  total: number;
} {
  const required = rules.filter((r) => r.isRequired);
  const completed = required.filter(isRuleComplete).length;
  return { completed, total: required.length };
}

export function isCustomRule(rule: LocationSchedulingRule): boolean {
  return !rule.isDefault || rule.category === "customRules";
}

export function getCustomRules(rules: LocationSchedulingRule[]): LocationSchedulingRule[] {
  return rules.filter(isCustomRule).sort((left, right) => left.sortOrder - right.sortOrder);
}

export function createCustomRule(existingCount: number): LocationSchedulingRule {
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
  };
}

export function getValueUnit(rule: LocationSchedulingRule): string | null {
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
  value: LocationSchedulingRuleValue,
  valueType: LocationSchedulingRule["valueType"],
): LocationSchedulingRuleValue {
  if (valueType === "number") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  if (valueType === "boolean") return Boolean(value);
  return value === null ? "" : String(value);
}

export function prepareRulesForSave(rules: LocationSchedulingRule[]): LocationSchedulingRule[] {
  return rules.map((rule, index) => ({
    ...rule,
    sortOrder: rule.sortOrder || index + 1,
    content: rule.content.trim(),
    inputLabel: rule.inputLabel.trim(),
    value: normalizeRuleValue(rule.value, rule.valueType),
  }));
}

export function patchRule(
  rules: LocationSchedulingRule[],
  key: string,
  patch: Partial<LocationSchedulingRule>,
): LocationSchedulingRule[] {
  return rules.map((rule) => (rule.key === key ? { ...rule, ...patch } : rule));
}

export function patchRuleValue(
  rules: LocationSchedulingRule[],
  key: string,
  value: LocationSchedulingRuleValue,
): LocationSchedulingRule[] {
  return patchRule(rules, key, { value, enabled: true });
}

export function removeRule(rules: LocationSchedulingRule[], key: string): LocationSchedulingRule[] {
  return rules.filter((rule) => rule.key !== key);
}

export const VALUE_TYPE_LABELS: Record<LocationSchedulingRule["valueType"], string> = {
  text: "Ghi chú (chữ)",
  number: "Số",
  boolean: "Bật / tắt",
};
