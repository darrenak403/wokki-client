import { WorkspacePanel } from "@/app/(app)/[orgId]/admin/workspace/components/workspace-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tổ chức chi nhánh — Manager",
  path: "/manager/workspace",
  noindex: true,
});

export default function ManagerBranchWorkspacePage() {
  return (
    <WorkspacePanel
      description="Sơ đồ phòng ban và nhân viên trong chi nhánh hiện tại."
      canWriteLocations={false}
      canWriteDepartments={false}
      canEditLocations
      canEditDepartments
      canAssignManagers={false}
      canTransferEmployees
      isManagerScope
      scopeToCurrentLocation
    />
  );
}
