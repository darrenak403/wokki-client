import type { Metadata } from "next";
import { getSiteUrl, SITE } from "./site";

type BuildPageMetadataOptions = {
  title: string;
  description?: string;
  path: string;
  noindex?: boolean;
};

function normalizePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

function socialTitle(title: string): string {
  const suffix = `| ${SITE.shortName}`;
  return title.includes(SITE.shortName) ? title : `${title} ${suffix}`;
}

export function buildPageMetadata({
  title,
  description = SITE.defaultDescription,
  path,
  noindex = false,
}: BuildPageMetadataOptions): Metadata {
  const pathname = normalizePath(path);
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${pathname}`;
  const ogTitle = socialTitle(title);

  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url: canonical,
      title: ogTitle,
      description,
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}
