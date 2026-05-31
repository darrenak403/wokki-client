import { ManagerDashboardPanel } from "@/app/(app)/[orgId]/[locationId]/manager/dashboard/components/ManagerDashboardPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Dashboard — Manager",
  description: "Tổng quan chi nhánh trong phạm vi quản lý.",
  path: "/manager/dashboard",
  noindex: true,
});

export default function ManagerDashboardPage() {
  return <ManagerDashboardPanel />;
}
