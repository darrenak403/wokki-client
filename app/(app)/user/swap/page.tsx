import { SwapPanel } from "@/app/(app)/user/swap/components/SwapPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đổi ca — Nhân viên",
  path: "/user/swap",
  noindex: true,
});

export default function UserSwapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Đổi ca</h1>
        <p className="text-sm text-muted-foreground">
          Gửi yêu cầu đổi ca hoặc phản hồi yêu cầu từ đồng nghiệp.
        </p>
      </div>
      <SwapPanel />
    </div>
  );
}
