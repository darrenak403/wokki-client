import type { OrgSubscriptionResponse, OrgSubscriptionStatus } from "@/types/stats";

function readString(raw: Record<string, unknown>, camel: string, pascal: string): string {
  const v = raw[camel] ?? raw[pascal];
  return v == null ? "" : String(v);
}

function readNumber(raw: Record<string, unknown>, camel: string, pascal: string): number {
  const v = raw[camel] ?? raw[pascal];
  return typeof v === "number" ? v : Number(v ?? 0);
}

function readNullableNumber(
  raw: Record<string, unknown>,
  camel: string,
  pascal: string
): number | null {
  const v = raw[camel] ?? raw[pascal];
  if (v == null) return null;
  return typeof v === "number" ? v : Number(v);
}

/** Normalizes BE subscription payload (camelCase or PascalCase). */
export function normalizeOrgSubscription(raw: unknown): OrgSubscriptionResponse {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const statusRaw = readString(o, "subscriptionStatus", "SubscriptionStatus");
  const subscriptionStatus = (
    ["NotActivated", "Active", "Expired", "Disabled"].includes(statusRaw)
      ? statusRaw
      : "NotActivated"
  ) as OrgSubscriptionStatus;

  return {
    organizationId: readString(o, "organizationId", "OrganizationId"),
    subscriptionStatus,
    subscriptionDurationDays: readNumber(o, "subscriptionDurationDays", "SubscriptionDurationDays"),
    subscriptionExpiresAt:
      (o.subscriptionExpiresAt ?? o.SubscriptionExpiresAt ?? null) as string | null,
    daysRemaining: readNullableNumber(o, "daysRemaining", "DaysRemaining"),
  };
}

export function formatSubscriptionDaysRemaining(days: number): string {
  if (days <= 0) return "Hết hạn hôm nay";
  if (days === 1) return "1";
  return String(days);
}

/** Normalizes org stats payload including subscription fields when present. */
export function normalizeOrgStats(raw: unknown): import("@/types/stats").OrgStatsResponse {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const sub = normalizeOrgSubscription({
    organizationId: o.organizationId ?? o.OrganizationId,
    subscriptionStatus: o.subscriptionStatus ?? o.SubscriptionStatus,
    subscriptionDurationDays: o.subscriptionDurationDays ?? o.SubscriptionDurationDays,
    subscriptionExpiresAt: o.subscriptionExpiresAt ?? o.SubscriptionExpiresAt,
    daysRemaining: o.daysRemaining ?? o.DaysRemaining,
  });

  return {
    organizationId: sub.organizationId,
    userCount: readNumber(o, "userCount", "UserCount"),
    locationCount: readNumber(o, "locationCount", "LocationCount"),
    departmentCount: readNumber(o, "departmentCount", "DepartmentCount"),
    employeeCount: readNumber(o, "employeeCount", "EmployeeCount"),
    activeLocationMembershipCount: readNumber(
      o,
      "activeLocationMembershipCount",
      "ActiveLocationMembershipCount"
    ),
    subscriptionStatus: sub.subscriptionStatus,
    subscriptionDurationDays: sub.subscriptionDurationDays,
    subscriptionExpiresAt: sub.subscriptionExpiresAt,
    daysRemaining: sub.daysRemaining,
  };
}

export function formatSubscriptionDaysLabel(days: number): string {
  if (days <= 0) return "Hết hạn hôm nay";
  if (days === 1) return "ngày còn lại";
  return "ngày còn lại";
}
