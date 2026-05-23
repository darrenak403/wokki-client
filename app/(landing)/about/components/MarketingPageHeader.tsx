import { Badge } from "@/components/ui/badge";

type MarketingPageHeaderProps = {
  badge?: string;
  title: string;
  description: string;
  eyebrow?: string;
};

export function MarketingPageHeader({ badge, title, description, eyebrow }: MarketingPageHeaderProps) {
  return (
    <header className="relative min-h-[62vh] overflow-hidden bg-white dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(76,136,198,0.20),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(16,40,84,0.14),transparent_44%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(76,136,198,0.22),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(16,40,84,0.28),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800" />
      <div className="relative mx-auto flex min-h-[62vh] max-w-7xl flex-col justify-center px-6 py-24 md:px-10 md:py-32">
        {badge ? (
          <Badge
            variant="outline"
            className="mb-5 w-fit rounded-full border-neutral-300 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-400"
          >
            {badge}
          </Badge>
        ) : null}
        <h1 className="max-w-5xl text-4xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-6xl lg:text-7xl dark:text-white">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 md:text-lg dark:text-neutral-400">
          {description}
        </p>
        {eyebrow ? (
          <p className="mt-8 text-sm text-neutral-400 dark:text-neutral-500">{eyebrow}</p>
        ) : null}
      </div>
    </header>
  );
}
