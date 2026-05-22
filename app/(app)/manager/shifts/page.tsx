import { ShiftsPanel } from "@/app/(app)/admin/shifts/components/shifts-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Ca định nghĩa — Manager",
  path: "/manager/shifts",
  noindex: true,
});

export default function ManagerShiftsPage() {
  return <ShiftsPanel />;
}
