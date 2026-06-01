import { DiscoverPanel } from "@/app/(org-less)/discover/components/DiscoverPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tìm tổ chức",
  description: "Chọn tổ chức để gửi yêu cầu tham gia Wokki.",
  path: "/discover",
  noindex: true,
});

export default function DiscoverPage() {
  return <DiscoverPanel />;
}
