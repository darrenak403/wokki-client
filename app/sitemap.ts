import type { MetadataRoute } from "next";
import { getPublicEntriesForSeo } from "@/lib/seo/fetch-public-seo";
import { getSiteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/community`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const entries = await getPublicEntriesForSeo();
  const dynamicRoutes: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${siteUrl}/${entry.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
