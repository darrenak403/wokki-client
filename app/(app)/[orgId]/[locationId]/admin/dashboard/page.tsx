import { AdminDashboardPanel } from "@/app/(app)/[orgId]/[locationId]/admin/dashboard/components/AdminDashboardPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Dashboard — Admin",
  description: "Tổng quan tổ chức Wokki.",
  path: "/admin/dashboard",
  noindex: true,
});

export default function AdminDashboardPage() {
  return <AdminDashboardPanel />;
}
