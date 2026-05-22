import { TeamAttendancePanel } from "@/app/(app)/admin/attendance/components/team-attendance-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Chấm công team — Admin",
  path: "/admin/attendance",
  noindex: true,
});

export default function AdminAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Chấm công team</h1>
        <p className="text-sm text-muted-foreground">
          Xem và điều chỉnh chấm công nhân viên (ghi chú bắt buộc khi chỉnh).
        </p>
      </div>
      <TeamAttendancePanel />
    </div>
  );
}
