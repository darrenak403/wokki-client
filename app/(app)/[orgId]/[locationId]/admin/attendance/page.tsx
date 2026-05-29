import { TeamAttendancePanel } from "@/app/(app)/[orgId]/[locationId]/admin/attendance/components/TeamAttendancePanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Chấm công team — Admin",
  path: "/admin/attendance",
  noindex: true,
});

export default function AdminAttendancePage() {
  return <TeamAttendancePanel />;
}
