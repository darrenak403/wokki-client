import { PayrollPanel } from "@/app/(app)/[orgId]/[locationId]/admin/payroll/components/PayrollPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Lương — Manager",
  path: "/manager/payroll",
  noindex: true,
});

export default function ManagerPayrollPage() {
  return <PayrollPanel canExportCsv={false} />;
}
