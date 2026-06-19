import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatCardBadge = {
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
};

type StatCardProps = {
  label: string;
  value: number | string;
  description?: string;
  badge?: StatCardBadge;
  className?: string;
};

export function StatCard({ label, value, description, badge, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {badge ? <Badge variant={badge.variant ?? "default"}>{badge.label}</Badge> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

type StatsGridProps = {
  children: ReactNode;
  columns?: 2 | 3 | 4;
};

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return <div className={cn("grid gap-4", colClass)}>{children}</div>;
}
