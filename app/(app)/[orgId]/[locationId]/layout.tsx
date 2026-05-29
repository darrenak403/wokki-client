import { TenantScopeGuard } from "@/components/shared/tenant-scope-guard";

export default function BranchScopedLayout({ children }: { children: React.ReactNode }) {
  return <TenantScopeGuard requireBranch>{children}</TenantScopeGuard>;
}
