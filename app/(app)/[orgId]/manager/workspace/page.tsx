import { WorkspaceBranchRedirect } from "@/app/(app)/[orgId]/admin/workspace/components/WorkspaceBranchRedirect";
import { buildPageMetadata } from "@/lib/support/seo/metadata";
import { ROLE_MANAGER } from "@/lib/types/roles";

export const metadata = buildPageMetadata({
  title: "Tổ chức — Manager",
  path: "/manager/workspace",
  noindex: true,
});

export default function ManagerWorkspacePage() {
  return <WorkspaceBranchRedirect role={ROLE_MANAGER} />;
}
