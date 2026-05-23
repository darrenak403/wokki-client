import { TeamAttendancePanel } from "@/app/(app)/admin/attendance/components/TeamAttendancePanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Chấm công team — Manager",
  path: "/manager/attendance",
  noindex: true,
});

export default function ManagerAttendancePage() {
  return <TeamAttendancePanel />;
}
