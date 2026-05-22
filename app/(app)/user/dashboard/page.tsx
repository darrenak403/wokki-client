import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Dashboard",
  description: "Khu vực nhân viên Wokki.",
  path: "/user/dashboard",
  noindex: true,
});

export default function UserDashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Khu làm việc dành cho nhân viên — xem lịch, đổi ca và chấm công sẽ nằm trong khu vực này.
      </p>
    </div>
  );
}
