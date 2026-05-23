import { HomePage } from "@/app/(landing)/components/HomePage";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Trang chủ",
  description:
    "Wokki — nền tảng quản lý lịch ca, chấm công và đội ngũ. Vận hành minh bạch cho retail, F&B và dịch vụ theo ca.",
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
