import { AppShell } from "@/components/app/app-shell";

/**
 * Khu vực quản lý sau đăng nhập — mọi tính năng nghiệp vụ nằm trong `(app)/`.
 * Guest dùng `(landing)/`; đăng nhập/đăng ký dùng `(auth)/`.
 */
export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
