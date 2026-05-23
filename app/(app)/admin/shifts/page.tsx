import { ShiftsPanel } from "@/app/(app)/admin/shifts/components/ShiftsPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Ca làm việc — Admin",
  path: "/admin/shifts",
  noindex: true,
});

export default function AdminShiftsPage() {
  return <ShiftsPanel />;
}
