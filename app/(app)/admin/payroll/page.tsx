import { PayrollPanel } from "@/app/(app)/admin/payroll/components/PayrollPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Lương — Admin",
  path: "/admin/payroll",
  noindex: true,
});

export default function AdminPayrollPage() {
  return <PayrollPanel canExportCsv />;
}
