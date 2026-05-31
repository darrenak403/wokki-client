import { MyPayrollPanel } from "@/app/(app)/[orgId]/[locationId]/user/payroll/components/MyPayrollPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Lương — Nhân viên",
  path: "/user/payroll",
  noindex: true,
});

export default function UserPayrollPage() {
  return <MyPayrollPanel />;
}
