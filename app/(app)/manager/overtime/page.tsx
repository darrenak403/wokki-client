"use client";

import { OTInboxPanel } from "@/app/(app)/admin/overtime/components/OTInboxPanel";
import { useFoundationSession } from "@/hooks/useFoundationSession";

export default function ManagerOvertimePage() {
  const { session } = useFoundationSession();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Quản lý tăng ca</h1>
      <OTInboxPanel departmentId={session.selectedDepartmentId ?? undefined} />
    </div>
  );
}
