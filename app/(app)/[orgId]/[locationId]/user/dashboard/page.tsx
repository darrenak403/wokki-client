import { UserDashboardPanel } from "@/app/(app)/[orgId]/[locationId]/user/dashboard/components/UserDashboardPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Dashboard",
  description: "Khu vực nhân viên Wokki.",
  path: "/user/dashboard",
  noindex: true,
});

export default function UserDashboardPage() {
  return <UserDashboardPanel />;
}
