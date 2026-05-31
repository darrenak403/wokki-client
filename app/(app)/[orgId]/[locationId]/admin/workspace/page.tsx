import { WorkspacePanel } from "@/app/(app)/[orgId]/admin/workspace/components/workspace-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tổ chức chi nhánh — Admin",
  path: "/admin/workspace",
  noindex: true,
});

export default function AdminBranchWorkspacePage() {
  return (
    <WorkspacePanel
      canWriteLocations
      canWriteDepartments
      canAssignManagers
      canTransferEmployees
      isManagerScope={false}
      scopeToCurrentLocation
    />
  );
}
