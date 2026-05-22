import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Dashboard — Manager",
  description: "Khu vực quản lý chi nhánh Wokki.",
  path: "/manager/dashboard",
  noindex: true,
});

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard Manager</h1>
      <p className="text-sm text-muted-foreground">
        Khu quản lý dành cho quản lý chi nhánh — lịch ca, chấm công, đổi ca và báo cáo sẽ nằm
        trong khu vực này.
      </p>
    </div>
  );
}
