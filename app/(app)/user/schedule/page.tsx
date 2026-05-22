import { MySchedulePanel } from "@/app/(app)/user/schedule/components/my-schedule-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Lịch của tôi — Nhân viên",
  path: "/user/schedule",
  noindex: true,
});

export default function UserSchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Lịch của tôi</h1>
        <p className="text-sm text-muted-foreground">
          Ca đã công bố trong 28 ngày tới — chỉ xem, không chỉnh sửa.
        </p>
      </div>
      <MySchedulePanel />
    </div>
  );
}
