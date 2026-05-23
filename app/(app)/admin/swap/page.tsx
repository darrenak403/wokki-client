import { SwapInboxPanel } from "@/app/(app)/admin/swap/components/SwapInboxPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đổi ca — Duyệt",
  path: "/admin/swap",
  noindex: true,
});

export default function AdminSwapPage() {
  return <SwapInboxPanel />;
}
