import { OrgPackagePageClient } from "@/app/(auth)/org-package/components/OrgPackagePageClient";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Gói sử dụng — Wokki",
  path: "/org-package",
  noindex: true,
});

export default function OrgPackagePage() {
  return <OrgPackagePageClient />;
}
