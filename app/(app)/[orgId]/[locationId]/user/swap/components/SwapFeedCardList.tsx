"use client";

import type { ReactNode } from "react";

type SwapFeedCardListProps = {
  title: string;
  count?: number;
  children: ReactNode;
  empty?: ReactNode;
  loading?: boolean;
};

export function SwapFeedCardList({
  title,
  count,
  children,
  empty,
  loading,
}: SwapFeedCardListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        {count != null && count > 0 ? (
          <span className="text-sm text-muted-foreground">({count})</span>
        ) : null}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Đang tải…</p>
      ) : empty != null ? (
        empty
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      )}
    </section>
  );
}
