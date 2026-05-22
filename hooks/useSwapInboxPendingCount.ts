"use client";

import { useAuth } from "@/hooks/useAuth";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { useSwapInboxQuery } from "@/hooks/useSwapRequests";
import { ROLE_ADMIN, ROLE_MANAGER } from "@/lib/types/roles";
import { toMondayISO } from "@/lib/support/schedule/week";
import { SWAP_STATUS } from "@/types/employee";

/** Lightweight pending swap count for nav badge (Wave 5). */
export function useSwapInboxPendingCount() {
  const { role } = useAuth();
  const opsRole = role === ROLE_ADMIN || role === ROLE_MANAGER;
  const { session } = useFoundationSession();
  const departmentId = session.selectedDepartmentId;
  const weekStartDate = toMondayISO(new Date());

  const { data } = useSwapInboxQuery(
    {
      page: 1,
      pageSize: 1,
      status: SWAP_STATUS.Pending,
      departmentId: departmentId ?? undefined,
      weekStartDate,
    },
    opsRole && Boolean(departmentId),
  );

  return data?.totalCount ?? 0;
}
