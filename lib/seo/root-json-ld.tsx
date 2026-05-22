import { getSiteUrlFromRequest } from "./request-site-url";
import { SITE } from "./site";

export async function RootJsonLd() {
  const siteUrl = await getSiteUrlFromRequest();

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: SITE.name,
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE.name,
        description: SITE.defaultDescription,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "vi",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
