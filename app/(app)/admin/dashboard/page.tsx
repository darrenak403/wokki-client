
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Dashboard — Admin",
  description: "Khu vực quản trị Wokki.",
  path: "/admin/dashboard",
  noindex: true,
});

export default function AdminDashboardPage() {
  return null;
}
