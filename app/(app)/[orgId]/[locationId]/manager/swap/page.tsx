import { SwapInboxPanel } from "@/app/(app)/[orgId]/[locationId]/admin/swap/components/SwapInboxPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đổi ca — Manager",
  path: "/manager/swap",
  noindex: true,
});

export default function ManagerSwapPage() {
  return <SwapInboxPanel />;
}
