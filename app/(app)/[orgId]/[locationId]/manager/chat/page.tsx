import { ChatPanel } from "@/app/(app)/[orgId]/[locationId]/admin/chat/components/ChatPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tin nhắn — Manager",
  path: "/manager/chat",
  noindex: true,
});

export default function ManagerChatPage() {
  return <ChatPanel canCreateChannel canModerateDelete={false} />;
}
