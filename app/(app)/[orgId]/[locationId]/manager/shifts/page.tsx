import { ShiftsPanel } from "@/app/(app)/[orgId]/[locationId]/admin/shifts/components/ShiftsPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Ca làm việc — Manager",
  path: "/manager/shifts",
  noindex: true,
});

export default function ManagerShiftsPage() {
  return <ShiftsPanel />;
}
  