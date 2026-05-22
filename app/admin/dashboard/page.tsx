import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-4xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
      <p className="text-muted-foreground">Chỉ truy cập được với role ROLE_ADMIN.</p>
    </main>
  );
}
