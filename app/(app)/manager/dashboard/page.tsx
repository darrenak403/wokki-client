import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Dashboard — Manager",
  description: "Khu vực quản lý chi nhánh Wokki.",
  path: "/manager/dashboard",
  noindex: true,
});

export default function ManagerDashboardPage() {
  return null;
}
