"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { useMyManagedLocationsQuery } from "@/hooks/useLocationManagers";
import { ActionItemsList } from "@/components/shared/dashboard/action-items-list";
import { fetchAttendance } from "@/lib/api/services/fetchAttendance";
import { fetchDepartments } from "@/lib/api/services/fetchDepartments";
import { fetchSchedules } from "@/lib/api/services/fetchSchedules";
import { fetchShifts } from "@/lib/api/services/fetchShifts";
import { fetchSwapPosts } from "@/lib/api/services/fetchSwapPosts";
import { foundationKeys, opsKeys, scheduleKeys, swapPostKeys } from "@/lib/api/query-keys";
import { toMondayISO, weekDayDates } from "@/lib/support/schedule/week";
import { SCHEDULE_STATUS } from "@/types/schedule";

function assignmentKey(shiftDefinitionId: string, date: string) {
  return `${shiftDefinitionId}|${date}`;
}

export function ManagerDashboardPanel() {
  const params = useParams<{ orgId: string; locationId: string }>();
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const weekStartDate = useMemo(() => toMondayISO(new Date()), []);
  const weekDays = useMemo(() => weekDayDates(weekStartDate), [weekStartDate]);

  const { data: locations = [], isLoading: locationsLoading } = useMyManagedLocationsQuery();
  const locationIds = useMemo(() => locations.map((l) => l.id), [locations]);

  const attendanceQueries = useQueries({
    queries: locationIds.map((locationId) => ({
      queryKey: opsKeys.attendanceSummary({ locationId, date: today }),
      queryFn: () => fetchAttendance.dailySummary({ locationId, date: today }),
      staleTime: 60_000,
    })),
  });

  const swapQueries = useQueries({
    queries: locationIds.map((locationId) => ({
      queryKey: swapPostKeys.adminFeed({ locationId, page: 1, pageSize: 1 }),
      queryFn: () => fetchSwapPosts.adminFeed({ locationId, page: 1, pageSize: 1 }),
      staleTime: 30_000,
    })),
  });

  const departmentQueries = useQueries({
    queries: locationIds.map((locationId) => ({
      queryKey: foundationKeys.departments(locationId),
      queryFn: () => fetchDepartments.list(locationId),
      staleTime: 300_000,
    })),
  });

  const departments = useMemo(
    () =>
      locationIds.flatMap((locationId, i) =>
        (departmentQueries[i]?.data ?? []).map((department) => ({
          ...department,
          locationId,
        })),
      ),
    [locationIds, departmentQueries],
  );

  const scheduleListQueries = useQueries({
    queries: departments.map((department) => ({
      queryKey: scheduleKeys.list({ departmentId: department.id, weekStartDate }),
      queryFn: () => fetchSchedules.list({ departmentId: department.id, weekStartDate }),
      staleTime: 60_000,
    })),
  });

  const shiftQueries = useQueries({
    queries: departments.map((department) => ({
      queryKey: foundationKeys.shifts({
        locationId: department.locationId,
        departmentId: department.id,
      }),
      queryFn: () =>
        fetchShifts.list({ locationId: department.locationId, departmentId: department.id }),
      staleTime: 300_000,
    })),
  });

  const schedulesThisWeek = useMemo(
    () => scheduleListQueries.map((q) => q.data?.items[0] ?? null),
    [scheduleListQueries],
  );

  const scheduleDetailQueries = useQueries({
    queries: schedulesThisWeek.map((schedule) => ({
      queryKey: scheduleKeys.detail(schedule?.id ?? ""),
      queryFn: () => fetchSchedules.getById(schedule!.id),
      enabled: Boolean(schedule),
      staleTime: 60_000,
    })),
  });

  const attendanceLoading = attendanceQueries.some((q) => q.isLoading);
  const attendanceError = attendanceQueries.some((q) => q.isError);
  const attendanceSummary = useMemo(
    () =>
      attendanceQueries.reduce(
        (acc, q) => {
          const data = q.data;
          if (!data) return acc;
          return {
            clockedIn: acc.clockedIn + data.clockedInCount,
            notClockedIn: acc.notClockedIn + data.notClockedInCount,
          };
        },
        { clockedIn: 0, notClockedIn: 0 },
      ),
    [attendanceQueries],
  );

  const scheduleLoading =
    departmentQueries.some((q) => q.isLoading) ||
    scheduleListQueries.some((q) => q.isLoading) ||
    shiftQueries.some((q) => q.isLoading) ||
    scheduleDetailQueries.some((q) => q.isLoading);
  const scheduleError =
    departmentQueries.some((q) => q.isError) ||
    scheduleListQueries.some((q) => q.isError) ||
    shiftQueries.some((q) => q.isError) ||
    scheduleDetailQueries.some((q) => q.isError);

  const scheduleSummary = useMemo(() => {
    let published = 0;
    let draft = 0;
    let unassigned = 0;

    departments.forEach((_department, i) => {
      const schedule = schedulesThisWeek[i];
      if (!schedule) return;

      if (schedule.status === SCHEDULE_STATUS.Published) published += 1;
      else if (schedule.status === SCHEDULE_STATUS.Draft) draft += 1;

      const activeShiftIds = new Set(
        (shiftQueries[i]?.data ?? []).filter((shift) => shift.isActive).map((shift) => shift.id),
      );
      const totalCells = activeShiftIds.size * weekDays.length;
      const assignments = scheduleDetailQueries[i]?.data?.assignments ?? [];
      const assignedKeys = new Set(
        assignments
          .filter((assignment) => activeShiftIds.has(assignment.shiftDefinitionId))
          .map((assignment) => assignmentKey(assignment.shiftDefinitionId, assignment.date)),
      );
      unassigned += Math.max(0, totalCells - assignedKeys.size);
    });

    return { published, draft, unassigned };
  }, [departments, schedulesThisWeek, shiftQueries, scheduleDetailQueries, weekDays]);

  const swapLoading = swapQueries.some((q) => q.isLoading);
  const swapError = swapQueries.some((q) => q.isError);
  const pendingSwapCount = useMemo(
    () => swapQueries.reduce((sum, q) => sum + (q.data?.totalCount ?? 0), 0),
    [swapQueries],
  );

  const attendanceHref = `/${params.orgId}/${params.locationId}/manager/attendance`;
  const scheduleHref = `/${params.orgId}/${params.locationId}/manager/schedule`;
  const swapHref = `/${params.orgId}/${params.locationId}/manager/swap`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <ActionItemsList
          title="Chấm công hôm nay"
          isLoading={locationsLoading || attendanceLoading}
          isError={attendanceError}
          items={[
            { label: "Đã chấm công vào", count: attendanceSummary.clockedIn, href: attendanceHref },
            { label: "Chưa chấm công", count: attendanceSummary.notClockedIn, href: attendanceHref },
          ]}
          emptyLabel="Không có chi nhánh nào được quản lý."
        />

        <ActionItemsList
          title="Lịch tuần này"
          isLoading={locationsLoading || scheduleLoading}
          isError={scheduleError}
          items={[
            { label: "Đã công bố", count: scheduleSummary.published, href: scheduleHref },
            { label: "Bản nháp", count: scheduleSummary.draft, href: scheduleHref },
            { label: "Ca chưa phân", count: scheduleSummary.unassigned, href: scheduleHref },
          ]}
          emptyLabel="Không có chi nhánh nào được quản lý."
        />

        <ActionItemsList
          title="Bài đăng đổi ca"
          isLoading={locationsLoading || swapLoading}
          isError={swapError}
          items={
            pendingSwapCount > 0
              ? [{ label: "Đang chờ nhận ca", count: pendingSwapCount, href: swapHref }]
              : []
          }
          emptyLabel="Không có bài đăng đổi ca đang chờ."
        />
      </div>
    </div>
  );
}
