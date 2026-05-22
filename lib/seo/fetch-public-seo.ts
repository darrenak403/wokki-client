import { cache } from "react";

export type PublicSeoEntry = {
  slug: string;
  title: string;
  description?: string;
};

const MAX_PAGES = 20;

async function fetchPage(page: number): Promise<PublicSeoEntry[]> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return [];

  try {
    const url = new URL("api/v1/public/seo-pages", base);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", "50");

    const res = await fetch(url.toString(), {
      next: { revalidate: 600 },
    });

    if (!res.ok) return [];

    const json = (await res.json()) as {
      success?: boolean;
      isSuccess?: boolean;
      data?: PublicSeoEntry[];
    };

    const ok = json.success ?? json.isSuccess;
    return ok && Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export const getPublicEntriesForSeo = cache(async (): Promise<PublicSeoEntry[]> => {
  const all: PublicSeoEntry[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await fetchPage(page);
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 50) break;
  }

  return all;
});

export async function getPublicEntrySeoBySlug(slug: string): Promise<PublicSeoEntry | null> {
  const entries = await getPublicEntriesForSeo();
  return entries.find((e) => e.slug === slug) ?? null;
}
