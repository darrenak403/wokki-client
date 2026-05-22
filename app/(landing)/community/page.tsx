import { CommunityPage } from "@/app/(landing)/components/community-page";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Cộng đồng",
  description:
    "Cộng đồng Wokki — playbook vận hành, sự kiện và kết nối với quản lý chi nhánh khác.",
  path: "/community",
});

export default function Page() {
  return <CommunityPage />;
}
