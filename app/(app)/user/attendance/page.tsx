import { AttendancePanel } from "@/app/(app)/user/attendance/components/attendance-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Chấm công — Nhân viên",
  path: "/user/attendance",
  noindex: true,
});

export default function UserAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Chấm công</h1>
        <p className="text-sm text-muted-foreground">
          Chấm vào / ra khi có ca hôm nay. Hệ thống giới hạn tần suất (300/phút).
        </p>
      </div>
      <AttendancePanel />
    </div>
  );
}
