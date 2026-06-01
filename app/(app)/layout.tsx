import { AppShell } from "@/components/app/app-shell";
import { FoundationSessionValidator } from "@/components/shared/foundation-session-validator";
import { MembershipGate } from "@/components/shared/membership-gate";
import { OrgAppGuard } from "@/components/shared/org-app-guard";
import { OrgMemberGuard } from "@/components/shared/org-member-guard";
import { OrgPackageGuard } from "@/components/shared/org-package-guard";
import { OrgSetupGuard } from "@/components/shared/org-setup-guard";

/**
 * Khu vực quản lý sau đăng nhập — mọi tính năng nghiệp vụ nằm trong `(app)/`.
 */
export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrgAppGuard>
      <OrgMemberGuard>
      <AppShell>
        <OrgPackageGuard>
          <OrgSetupGuard>
            <FoundationSessionValidator />
            <MembershipGate>{children}</MembershipGate>
          </OrgSetupGuard>
        </OrgPackageGuard>
      </AppShell>
      </OrgMemberGuard>
    </OrgAppGuard>
  );
}
