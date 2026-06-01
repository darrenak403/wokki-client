import { JoinRequestPanel } from "@/app/(org-less)/join-request/components/JoinRequestPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Yêu cầu tham gia",
  description: "Trạng thái yêu cầu tham gia tổ chức.",
  path: "/join-request",
  noindex: true,
});

export default function JoinRequestPage() {
  return <JoinRequestPanel />;
}
