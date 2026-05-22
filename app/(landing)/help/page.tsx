import { HelpPage } from "@/app/(landing)/components/help-page";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Trợ giúp",
  description:
    "Trung tâm trợ giúp Wokki — FAQ, hướng dẫn theo vai trò và liên hệ support.",
  path: "/help",
});

export default function Page() {
  return <HelpPage />;
}
