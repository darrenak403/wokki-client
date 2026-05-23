import { PricingPage } from "@/app/(landing)/pricing/components/PricingPage";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Bảng giá",
  description:
    "Bảng giá Wokki — gói Starter miễn phí, Business cho chuỗi chi nhánh, Enterprise tùy quy mô.",
  path: "/pricing",
});

export default function Page() {
  return <PricingPage />;
}
