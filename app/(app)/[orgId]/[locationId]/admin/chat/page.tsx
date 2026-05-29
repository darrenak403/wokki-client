import { ChatPanel } from "@/app/(app)/[orgId]/[locationId]/admin/chat/components/ChatPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tin nhắn — Admin",
  path: "/admin/chat",
  noindex: true,
});

export default function AdminChatPage() {
  return <ChatPanel canCreateChannel canModerateDelete />;
}
