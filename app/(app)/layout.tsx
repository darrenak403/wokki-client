import { AppShell } from "@/components/app/app-shell";
import { FoundationSessionValidator } from "@/components/shared/foundation-session-validator";
import { MembershipGate } from "@/components/shared/membership-gate";
import { OrgAppGuard } from "@/components/shared/org-app-guard";
import { OrgSetupGuard } from "@/components/shared/org-setup-guard";

/**
 * Khu vực quản lý sau đăng nhập — mọi tính năng nghiệp vụ nằm trong `(app)/`.
 */
export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrgAppGuard>
      <AppShell>
        <OrgSetupGuard>
          <FoundationSessionValidator />
          <MembershipGate>{children}</MembershipGate>
        </OrgSetupGuard>
      </AppShell>
    </OrgAppGuard>
  );
}
