import { SwapMarketplacePanel } from "@/app/(app)/[orgId]/[locationId]/user/swap/components/SwapMarketplacePanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đổi ca — Nhân viên",
  path: "/user/swap",
  noindex: true,
});

export default function UserSwapPage() {
  return <SwapMarketplacePanel />;
}
