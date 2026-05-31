import { MySchedulePanel } from "@/app/(app)/[orgId]/[locationId]/user/schedule/components/MySchedulePanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Lịch của tôi — Nhân viên",
  path: "/user/schedule",
  noindex: true,
});

export default function UserSchedulePage() {
  return <MySchedulePanel />;
}
