import { AboutPage } from "@/app/(landing)/about/components/about-page";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Về chúng tôi",
  description:
    "Về Wokki — sứ mệnh, giá trị và hành trình xây nền tảng quản lý lịch ca cho doanh nghiệp vận hành thực tế.",
  path: "/about",
});

export default function Page() {
  return <AboutPage />;
}
