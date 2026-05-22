import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-4xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">Khu vực đã đăng nhập — bảo vệ bởi middleware RBAC.</p>
    </main>
  );
}
