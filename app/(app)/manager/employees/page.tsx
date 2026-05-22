import { EmployeesPanel } from "@/app/(app)/admin/employees/components/employees-panel";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Nhân sự — Manager",
  path: "/manager/employees",
  noindex: true,
});

export default function ManagerEmployeesPage() {
  return <EmployeesPanel canWrite={false} />;
}
