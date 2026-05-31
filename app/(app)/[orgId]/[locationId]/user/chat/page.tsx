import { ChatPanel } from "@/app/(app)/[orgId]/[locationId]/admin/chat/components/ChatPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tin nhắn — Nhân viên",
  path: "/user/chat",
  noindex: true,
});

export default function UserChatPage() {
  return <ChatPanel canModerateDelete={false} />;
}
