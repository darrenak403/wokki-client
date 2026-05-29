import { EmployeesPanel } from "@/app/(app)/[orgId]/[locationId]/admin/employees/components/EmployeesPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Nhân sự — Manager",
  path: "/manager/employees",
  noindex: true,
});

export default function ManagerEmployeesPage() {
  return <EmployeesPanel canTransfer />;
}
