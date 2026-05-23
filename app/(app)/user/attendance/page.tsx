import { AttendancePanel } from "@/app/(app)/user/attendance/components/AttendancePanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Chấm công — Nhân viên",
  path: "/user/attendance",
  noindex: true,
});

export default function UserAttendancePage() {
  return <AttendancePanel />;
}
