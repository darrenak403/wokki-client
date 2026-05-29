import { WorkspacePanel } from "@/app/(app)/[orgId]/admin/workspace/components/workspace-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tổ chức — Manager",
  path: "/manager/workspace",
  noindex: true,
});

export default function ManagerWorkspacePage() {
  return (
    <WorkspacePanel
      description="Sơ đồ chi nhánh trong phạm vi quản lý — chuyển nhân viên giữa chi nhánh/phòng ban."
      canWriteLocations={false}
      canWriteDepartments={false}
      canEditLocations
      canEditDepartments
      canAssignManagers={false}
      canTransferEmployees
      isManagerScope
    />
  );
}
