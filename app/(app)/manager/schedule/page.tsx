import { SchedulePanel } from "@/app/(app)/admin/schedule/components/schedule-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Lịch ca — Manager",
  path: "/manager/schedule",
  noindex: true,
});

export default function ManagerSchedulePage() {
  return <SchedulePanel />;
}
