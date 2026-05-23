import { DepartmentsPanel } from "@/app/(app)/admin/departments/components/DepartmentsPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Phòng ban — Admin",
  path: "/admin/departments",
  noindex: true,
});

export default function AdminDepartmentsPage() {
  return <DepartmentsPanel canWrite />;
}
