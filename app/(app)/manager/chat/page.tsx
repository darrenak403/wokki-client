import { ChatPanel } from "@/app/(app)/admin/chat/components/chat-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tin nhắn — Manager",
  path: "/manager/chat",
  noindex: true,
});

export default function ManagerChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Tin nhắn</h1>
        <p className="text-sm text-muted-foreground">Chat nội bộ — tạo kênh và nhắn với team.</p>
      </div>
      <ChatPanel canCreateChannel canModerateDelete={false} />
    </div>
  );
}
