"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { endOfWeek, parseISO, startOfWeek } from "date-fns";
import { NoEmployeeLinked } from "@/app/(app)/[orgId]/[locationId]/user/components/NoEmployeeLinked";
import { ActionItemsList, type ActionItem } from "@/components/shared/dashboard/action-items-list";
import { useUnreadCountQuery } from "@/hooks/useChat";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import {
  useEmployeePreferenceScheduleQuery,
  useMySchedulePreferencesQuery,
} from "@/hooks/useSchedulePreferences";
import { useMySwapPostsQuery } from "@/hooks/useSwapPosts";
import { addWeeksISO, toMondayISO } from "@/lib/support/schedule/week";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import type { ApiError } from "@/types/api";
import { SWAP_POST_STATUS } from "@/types/employee";
import { SCHEDULE_STATUS } from "@/types/schedule";

export function UserDashboardPanel() {
  const params = useParams<{ orgId: string; locationId: string }>();
  const nextWeekStartDate = useMemo(() => addWeeksISO(toMondayISO(new Date()), 1), []);

  const scheduleQuery = useMyScheduleQuery();
  const errorCode =
    scheduleQuery.isError && scheduleQuery.error && typeof scheduleQuery.error === "object" && "messageCode" in scheduleQuery.error
      ? (scheduleQuery.error as unknown as ApiError).messageCode
      : undefined;
  const noEmployee = errorCode === "ME_NO_EMPLOYEE";

  const shiftsThisWeek = useMemo(() => {
    const assignments = scheduleQuery.data ?? [];
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    return assignments.filter((a) => {
      const d = parseISO(a.date);
      return d >= weekStart && d <= weekEnd;
    }).length;
  }, [scheduleQuery.data]);

  const preferenceScheduleQuery = useEmployeePreferenceScheduleQuery(nextWeekStartDate);
  const preferenceScheduleId = preferenceScheduleQuery.data?.scheduleId ?? null;
  const submissionQuery = useMySchedulePreferencesQuery(preferenceScheduleId);

  const swapPostsQuery = useMySwapPostsQuery(
    { scheduleId: preferenceScheduleId ?? undefined, page: 1, pageSize: 50 },
    Boolean(preferenceScheduleId),
  );
  const swapSummary = useMemo(() => {
    const items = swapPostsQuery.data?.items ?? [];
    return {
      pending: items.filter((p) => p.status === SWAP_POST_STATUS.Pending).length,
      completed: items.filter((p) => p.status === SWAP_POST_STATUS.Completed).length,
    };
  }, [swapPostsQuery.data]);

  const unreadQuery = useUnreadCountQuery();

  const scheduleHref = `/${params.orgId}/${params.locationId}/user/schedule`;
  const swapHref = `/${params.orgId}/${params.locationId}/user/swap`;
  const chatHref = `/${params.orgId}/${params.locationId}/user/chat`;

  const preferenceItems: ActionItem[] = preferenceScheduleId
    ? [
        {
          label: `${submissionQuery.data?.status === "Submitted" ? "Đã gửi" : "Chưa gửi"} đăng ký ca tuần tới (${
            preferenceScheduleQuery.data?.status === SCHEDULE_STATUS.Draft ? "đang mở" : "đã khóa"
          })`,
          count: submissionQuery.data?.lines.length ?? 0,
          href: scheduleHref,
        },
      ]
    : [];

  const swapItems: ActionItem[] = [
    ...(swapSummary.pending > 0
      ? [{ label: "Bài đăng đang chờ nhận ca", count: swapSummary.pending, href: swapHref }]
      : []),
    ...(swapSummary.completed > 0
      ? [{ label: "Đã đổi ca thành công", count: swapSummary.completed, href: swapHref }]
      : []),
  ];

  const unreadItems: ActionItem[] =
    (unreadQuery.data?.total ?? 0) > 0
      ? [{ label: "Tin nhắn chưa đọc", count: unreadQuery.data!.total, href: chatHref }]
      : [];

  if (noEmployee) {
    return <NoEmployeeLinked />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ActionItemsList
        title="Ca làm tuần này"
        isLoading={scheduleQuery.isLoading}
        isError={scheduleQuery.isError && !noEmployee}
        errorLabel={mapEmployeeError(scheduleQuery.error)}
        items={
          shiftsThisWeek > 0
            ? [{ label: "Ca đã được phân tuần này", count: shiftsThisWeek, href: scheduleHref }]
            : []
        }
        emptyLabel="Chưa có ca nào trong tuần này."
      />

      <ActionItemsList
        title="Đăng ký ca tuần tới"
        isLoading={preferenceScheduleQuery.isLoading || submissionQuery.isLoading}
        isError={preferenceScheduleQuery.isError || submissionQuery.isError}
        items={preferenceItems}
        emptyLabel="Chưa có lịch tuần cho phòng ban của bạn."
      />

      <ActionItemsList
        title="Bài đăng đổi ca của tôi"
        isLoading={swapPostsQuery.isLoading}
        isError={swapPostsQuery.isError}
        items={swapItems}
        emptyLabel="Không có bài đăng đổi ca nào."
      />

      <ActionItemsList
        title="Tin nhắn"
        isLoading={unreadQuery.isLoading}
        isError={unreadQuery.isError}
        items={unreadItems}
        emptyLabel="Không có tin nhắn chưa đọc."
      />
    </div>
  );
}
