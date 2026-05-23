import { SwapPanel } from "@/app/(app)/user/swap/components/SwapPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đổi ca — Nhân viên",
  path: "/user/swap",
  noindex: true,
});

export default function UserSwapPage() {
  return <SwapPanel />;
}
