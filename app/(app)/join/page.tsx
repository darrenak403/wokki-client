import { buildPageMetadata } from "@/lib/support/seo/metadata";
import { JoinPage } from "./components/JoinPage";

export const metadata = buildPageMetadata({
  title: "Chọn chi nhánh",
  path: "/join",
  noindex: true,
});

export default function JoinRoute() {
  return <JoinPage />;
}
