import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Dashboard — Admin",
  description: "Khu vực quản trị Wokki.",
  path: "/admin/dashboard",
  noindex: true,
});

export default function AdminDashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard Admin</h1>
      <p className="text-sm text-muted-foreground">
        Khu quản lý dành cho Admin — người dùng, master data và vận hành toàn hệ thống sẽ được
        bổ sung theo từng wave.
      </p>
    </div>
  );
}
