import { SchedulePanel } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/SchedulePanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Lịch ca — Admin",
  path: "/admin/schedule",
  noindex: true,
});

export default function AdminSchedulePage() {
  return <SchedulePanel />;
}
