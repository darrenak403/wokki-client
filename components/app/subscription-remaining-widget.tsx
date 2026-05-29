"use client";

import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ClockIcon } from "lucide-react";
import { useOrgSubscriptionQuery } from "@/hooks/useOrgSubscription";
import {
  formatSubscriptionDaysLabel,
  formatSubscriptionDaysRemaining,
} from "@/lib/support/org/subscription";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SubscriptionRemainingWidgetProps = {
  variant?: "header";
};

export function SubscriptionRemainingWidget({
  variant = "header",
}: SubscriptionRemainingWidgetProps) {
  const { data, isLoading } = useOrgSubscriptionQuery();

  if (isLoading || !data || data.subscriptionStatus !== "Active" || data.daysRemaining == null) {
    return null;
  }

  const days = data.daysRemaining;
  const expiresLabel =
    data.subscriptionExpiresAt != null
      ? format(parseISO(data.subscriptionExpiresAt), "dd/MM/yyyy", { locale: vi })
      : null;
  const packageDays = data.subscriptionDurationDays > 0 ? data.subscriptionDurationDays : null;

  const urgent = days <= 3;
  const warning = days <= 7 && !urgent;

  const tooltipText = [
    packageDays != null ? `Gói ${packageDays} ngày` : null,
    days <= 0 ? "Hết hạn hôm nay" : `Còn ${days} ngày`,
    expiresLabel ? `hết hạn ${expiresLabel}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const toneClass = urgent
    ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100"
    : warning
      ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
      : "border-[#BCE8F5]/60 bg-[#EEF6FB]/90 text-[#1D4D8F] dark:border-[#4C88C6]/30 dark:bg-[#0B1E3D]/60 dark:text-[#BCE8F5]";

  if (variant === "header") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <div
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 tabular-nums sm:h-9 sm:px-3",
                toneClass
              )}
              aria-live="polite"
            >
              <ClockIcon className="size-3.5 shrink-0 sm:size-4" aria-hidden />
              <div className="flex items-baseline gap-1 leading-none">
                <span className="text-base font-extrabold sm:text-lg">
                  {formatSubscriptionDaysRemaining(days)}
                </span>
                <span className="hidden text-[10px] font-medium opacity-90 sm:inline">
                  {formatSubscriptionDaysLabel(days)}
                </span>
              </div>
            </div>
          }
        />
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    );
  }

  return null;
}
