import { EmployeesHubPanel } from "@/app/(app)/[orgId]/[locationId]/admin/employees/components/EmployeesHubPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Nhân sự — Admin",
  path: "/admin/employees",
  noindex: true,
});

export default function AdminEmployeesPage() {
  return <EmployeesHubPanel />;
}
