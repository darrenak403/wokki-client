import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SwapFeedCardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm",
        className,
      )}
    >
      {children}
    </article>
  );
}
