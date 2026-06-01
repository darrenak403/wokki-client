import { JoinRequestsPanel } from "@/app/(app)/[orgId]/admin/join-requests/components/JoinRequestsPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Yêu cầu tham gia — Admin",
  description: "Duyệt yêu cầu nhân viên tự đăng ký tham gia tổ chức.",
  path: "/admin/join-requests",
  noindex: true,
});

export default function AdminJoinRequestsPage() {
  return <JoinRequestsPanel />;
}
