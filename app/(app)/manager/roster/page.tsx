import { RosterPanel } from "@/app/(app)/admin/roster/components/RosterPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Lịch tổng chi nhánh — Manager",
  path: "/manager/roster",
  noindex: true,
});

export default function ManagerRosterPage() {
  return <RosterPanel />;
}
