import { PayrollPanel } from "@/app/(app)/admin/payroll/components/PayrollPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Lương — Manager",
  path: "/manager/payroll",
  noindex: true,
});

export default function ManagerPayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Lương</h1>
        <p className="text-sm text-muted-foreground">
          Tổng lương theo phòng ban và kỳ (chỉ xem).
        </p>
      </div>
      <PayrollPanel canExportCsv={false} />
    </div>
  );
}
