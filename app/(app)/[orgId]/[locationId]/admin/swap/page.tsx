import { SwapAuditPanel } from "@/app/(app)/[orgId]/[locationId]/admin/swap/components/SwapAuditPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đổi ca — Nhật ký",
  path: "/admin/swap",
  noindex: true,
});

export default function AdminSwapPage() {
  return <SwapAuditPanel />;
}
