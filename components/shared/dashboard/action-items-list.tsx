import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActionItem = {
  label: string;
  count: number;
  href: string;
};

type ActionItemsListProps = {
  title: string;
  items?: ActionItem[];
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel?: string;
  errorLabel?: string;
  className?: string;
};

export function ActionItemsList({
  title,
  items,
  isLoading,
  isError,
  emptyLabel = "Không có việc cần xử lý.",
  errorLabel = "Không tải được danh sách.",
  className,
}: ActionItemsListProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900",
        className
      )}
    >
      <h3 className="font-medium">{title}</h3>

      <div className="mt-3 space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : isError ? (
          <p className="text-sm text-destructive">{errorLabel}</p>
        ) : !items || items.length === 0 ? (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <Inbox className="size-4" />
            <span>{emptyLabel}</span>
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between gap-3 rounded-md border border-transparent px-2 py-2 text-sm transition-colors hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-800/50"
            >
              <span className="truncate">{item.label}</span>
              <span className="flex shrink-0 items-center gap-1 font-medium tabular-nums">
                {item.count}
                <ChevronRight className="size-4 text-muted-foreground" />
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
