"use client";

import { OTInboxPanel } from "@/app/(app)/[orgId]/[locationId]/admin/overtime/components/OTInboxPanel";
import { useFoundationSession } from "@/hooks/useFoundationSession";

export default function ManagerOvertimePage() {
  const { session } = useFoundationSession();
  return (
    <div className="space-y-6">
      <OTInboxPanel departmentId={session.selectedDepartmentId ?? undefined} />
    </div>
  );
}
