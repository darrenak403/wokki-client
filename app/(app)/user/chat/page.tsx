import { ChatPanel } from "@/app/(app)/admin/chat/components/chat-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tin nhắn — Nhân viên",
  path: "/user/chat",
  noindex: true,
});

export default function UserChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Tin nhắn</h1>
        <p className="text-sm text-muted-foreground">Chat với đồng nghiệp và quản lý.</p>
      </div>
      <ChatPanel canCreateChannel={false} canModerateDelete={false} />
    </div>
  );
}
