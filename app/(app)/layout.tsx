import { AppShell } from "@/components/app/app-shell";
import { FoundationSessionValidator } from "@/components/shared/foundation-session-validator";
import { MembershipGate } from "@/components/shared/membership-gate";

/**
 * Khu vực quản lý sau đăng nhập — mọi tính năng nghiệp vụ nằm trong `(app)/`.
 * Guest dùng `(landing)/`; đăng nhập/đăng ký dùng `(auth)/`.
 */
export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <FoundationSessionValidator />
      <MembershipGate>{children}</MembershipGate>
    </AppShell>
  );
}
