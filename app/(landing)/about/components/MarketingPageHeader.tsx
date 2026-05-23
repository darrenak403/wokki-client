import { Badge } from "@/components/ui/badge";

type MarketingPageHeaderProps = {
  badge?: string;
  title: string;
  description: string;
};

export function MarketingPageHeader({ badge, title, description }: MarketingPageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--brand-light)_40%,transparent),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--brand-medium)_18%,transparent),transparent_65%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        {badge ? (
          <Badge
            variant="outline"
            className="mb-5 rounded-full border-neutral-300 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-400"
          >
            {badge}
          </Badge>
        ) : null}
        <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-neutral-900 md:text-5xl dark:text-white">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-500 md:text-lg dark:text-neutral-400">
          {description}
        </p>
      </div>
    </header>
  );
}
