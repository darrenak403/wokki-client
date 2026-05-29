import { TenantScopeGuard } from "@/components/shared/tenant-scope-guard";

export default function OrgIdLayout({ children }: { children: React.ReactNode }) {
  return <TenantScopeGuard>{children}</TenantScopeGuard>;
}
