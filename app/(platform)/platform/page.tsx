import { PlatformHome, PlatformShell } from "@/app/(platform)/platform/components/PlatformShell";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Platform — Wokki",
  path: "/platform",
  noindex: true,
});

export default function PlatformPage() {
  return (
    <PlatformShell>
      <PlatformHome />
    </PlatformShell>
  );
}
