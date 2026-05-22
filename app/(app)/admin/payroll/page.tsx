import { PayrollPanel } from "@/app/(app)/admin/payroll/components/payroll-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Lương — Admin",
  path: "/admin/payroll",
  noindex: true,
});

export default function AdminPayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Lương</h1>
        <p className="text-sm text-muted-foreground">
          Tổng lương theo phòng ban và kỳ. Chủ quán có thể xuất CSV.
        </p>
      </div>
      <PayrollPanel canExportCsv />
    </div>
  );
}
