import { SwapInboxPanel } from "@/app/(app)/admin/swap/components/SwapInboxPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đổi ca — Manager",
  path: "/manager/swap",
  noindex: true,
});

export default function ManagerSwapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Đổi ca</h1>
        <p className="text-sm text-muted-foreground">
          Duyệt hoặc từ chối yêu cầu đổi ca đang chờ.
        </p>
      </div>
      <SwapInboxPanel />
    </div>
  );
}
