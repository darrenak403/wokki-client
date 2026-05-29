import { WorkspaceBranchRedirect } from "@/app/(app)/[orgId]/admin/workspace/components/WorkspaceBranchRedirect";
import { buildPageMetadata } from "@/lib/support/seo/metadata";
import { ROLE_ADMIN } from "@/lib/types/roles";

export const metadata = buildPageMetadata({
  title: "Tổ chức — Admin",
  path: "/admin/workspace",
  noindex: true,
});

export default function AdminWorkspacePage() {
  return <WorkspaceBranchRedirect role={ROLE_ADMIN} />;
}
