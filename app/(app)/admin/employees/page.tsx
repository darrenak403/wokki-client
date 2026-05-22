import { EmployeesPanel } from "@/app/(app)/admin/employees/components/employees-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Nhân sự — Admin",
  path: "/admin/employees",
  noindex: true,
});

export default function AdminEmployeesPage() {
  return <EmployeesPanel canWrite />;
}
