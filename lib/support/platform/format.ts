import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { SubscriptionStatus } from "@/types/platform";

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  NotActivated: "Chưa có gói",
  Active: "Đang hoạt động",
  Expired: "Hết hạn",
  Disabled: "Đã tắt",
};

export function subscriptionStatusVariant(
  status: SubscriptionStatus | string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Active":
      return "default";
    case "Expired":
      return "destructive";
    case "Disabled":
      return "secondary";
    default:
      return "outline";
  }
}

export function subscriptionStatusLabel(status: SubscriptionStatus | string): string {
  return SUBSCRIPTION_STATUS_LABEL[status as SubscriptionStatus] ?? status;
}

export function ledgerActionLabel(action: string): string {
  switch (action) {
    case "Activated":
      return "Kích hoạt";
    case "Renewed":
      return "Gia hạn";
    case "Disabled":
      return "Tắt gói";
    case "DurationChanged":
      return "Đổi thời hạn";
    default:
      return action || "—";
  }
}

export function platformEventTypeLabel(eventType: string): string {
  switch (eventType) {
    case "auth.login":
      return "Đăng nhập";
    case "schedule.publish":
      return "Công bố lịch";
    case "schedule.suggest":
      return "Gợi ý lịch";
    case "schedule.apply_suggestions":
      return "Áp dụng gợi ý";
    case "attendance.clock_in":
      return "Clock-in";
    case "attendance.clock_out":
      return "Clock-out";
    case "chat.message":
      return "Tin nhắn";
    default:
      return eventType || "—";
  }
}

export function formatPlatformDate(value: string | null | undefined): string {
  if (!value) return "—";
  return format(parseISO(value), "dd/MM/yyyy", { locale: vi });
}

export function formatPlatformDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return format(parseISO(value), "dd/MM/yyyy HH:mm", { locale: vi });
}

export function toStartOfDayUtc(date: string): string | undefined {
  return date ? `${date}T00:00:00.000Z` : undefined;
}

export function toEndOfDayUtc(date: string): string | undefined {
  return date ? `${date}T23:59:59.999Z` : undefined;
}
