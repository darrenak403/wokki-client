import { SwapAdminPanel } from "@/app/(app)/[orgId]/[locationId]/admin/swap/components/SwapAdminPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đổi ca — Admin",
  path: "/admin/swap",
  noindex: true,
});

export default function AdminSwapPage() {
  return <SwapAdminPanel />;
}
