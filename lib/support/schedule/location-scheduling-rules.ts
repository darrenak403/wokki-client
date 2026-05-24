import type { LocationSchedulingRule, LocationSchedulingRuleValue } from "@/types/foundation";

export const LOCATION_SCHEDULING_POLICY_SCHEMA = "location-scheduling-policy.v3";

export const DEFAULT_RULE_KEYS = [
  "max_shifts_per_week",
  "max_shifts_per_day",
  "require_role_match",
  "require_submitted_preferences",
  "unavailable_is_hard_block",
] as const;

export const BRANCH_RULE_SECTIONS = [
  {
    id: "employeeLimits",
    label: "Giới hạn ca cho nhân viên",
    description:
      "Quy tắc về số ca và vai trò khi hệ thống xếp lịch chính thức cho nhân viên thuộc chi nhánh này.",
    keys: ["max_shifts_per_week", "max_shifts_per_day", "require_role_match"],
  },
  {
    id: "preferenceRules",
    label: "Bảng đăng ký ca",
    description:
      "Quy tắc dựa trên bảng đăng ký ca nhân viên đã gửi trước khi manager chạy gợi ý lịch tuần tiếp theo.",
    keys: ["require_submitted_preferences", "unavailable_is_hard_block"],
  },
] as const;

export const CUSTOM_RULES_SECTION = {
  id: "customRules",
  label: "Luật riêng của chi nhánh",
  description:
    "Admin/Manager có thể thêm quy định nội bộ (ví dụ nhắc nhở vận hành, mức riêng theo mùa). Luật riêng được lưu tại chi nhánh; năm luật hệ thống ở trên mới được thuật toán gợi ý ca dùng trực tiếp.",
} as const;

export function isDefaultRuleKey(key: string): boolean {
  return (DEFAULT_RULE_KEYS as readonly string[]).includes(key);
}

export function isCustomRule(rule: LocationSchedulingRule): boolean {
  return !rule.isDefault;
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
    valueType: "text",
    value: "",
    enabled: true,
    isDefault: false,
    isRequired: false,
    sortOrder: 10_000 + existingCount,
  };
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
