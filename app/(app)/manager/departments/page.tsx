import { DepartmentsPanel } from "@/app/(app)/admin/departments/components/departments-panel";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Phòng ban — Manager",
  path: "/manager/departments",
  noindex: true,
});

export default function ManagerDepartmentsPage() {
  return <DepartmentsPanel canWrite={false} />;
}
