import { Badge } from "@/components/ui/badge";

type MarketingPageHeaderProps = {
  badge?: string;
  title: string;
  description: string;
};

export function MarketingPageHeader({ badge, title, description }: MarketingPageHeaderProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
        {badge ? (
          <Badge variant="secondary" className="mb-4 w-fit">
            {badge}
          </Badge>
        ) : null}
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{description}</p>
      </div>
    </header>
  );
}
