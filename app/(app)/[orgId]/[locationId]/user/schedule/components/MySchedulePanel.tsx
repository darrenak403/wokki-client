"use client";

import { MyLeaveRequestTab } from "@/app/(app)/[orgId]/[locationId]/user/schedule/components/MyLeaveRequestTab";
import { MyPreferencesTab } from "@/app/(app)/[orgId]/[locationId]/user/schedule/components/MyPreferencesTab";
import { NoEmployeeLinked } from "@/app/(app)/[orgId]/[locationId]/user/components/NoEmployeeLinked";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployeePreferenceScheduleQuery } from "@/hooks/useSchedulePreferences";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { addWeeksISO, toMondayISO } from "@/lib/support/schedule/week";
import type { ApiError } from "@/types/api";
import { SCHEDULE_STATUS } from "@/types/schedule";
import { useMemo, useState } from "react";
import { MyPublishedScheduleView } from "./MyPublishedScheduleView";

export function MySchedulePanel() {
  const [tab, setTab] = useState("published");
  const [weekStartDate] = useState(() => addWeeksISO(toMondayISO(new Date()), 1));
  const { isError, error } = useMyScheduleQuery();
  const { data: preferenceSchedule } = useEmployeePreferenceScheduleQuery(weekStartDate);
  const errorCode =
    isError && error && typeof error === "object" && "messageCode" in error
      ? (error as unknown as ApiError).messageCode
      : undefined;
  const noEmployee = errorCode === "ME_NO_EMPLOYEE";
  const leaveScheduleId = preferenceSchedule?.scheduleId ?? null;
  const leaveShifts = useMemo(
    () =>
      (preferenceSchedule?.shifts ?? []).map((s) => ({
        id: s.shiftDefinitionId,
        name: s.shiftName,
      })),
    [preferenceSchedule?.shifts]
  );

  if (noEmployee) {
    return <NoEmployeeLinked />;
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="published"
          className="shrink-0 rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-0 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-b-[10px] data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none"
        >
          Lịch đã công bố
        </TabsTrigger>
        <TabsTrigger
          value="preferences"
          className="shrink-0 rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-0 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-b-[10px] data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none"
        >
          Đăng ký ca
        </TabsTrigger>
        <TabsTrigger
          value="leave"
          className="shrink-0 rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-0 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-b-[10px] data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none"
        >
          Xin nghỉ
        </TabsTrigger>
      </TabsList>
      <TabsContent value="published" className="mt-0 space-y-2">
        <MyPublishedScheduleView />
      </TabsContent>
      <TabsContent value="preferences" className="mt-0 space-y-2">
        <p className="text-sm text-muted-foreground">
          Chọn ca bạn muốn làm — quản lý quyết định lịch cuối cùng.
        </p>
        <MyPreferencesTab />
      </TabsContent>
      <TabsContent value="leave" className="mt-0 space-y-2">
        <p className="text-sm text-muted-foreground">
          Xin nghỉ ca trước khi lịch tuần được công bố — quản lý duyệt sẽ cập nhật đăng ký.
        </p>
        {leaveScheduleId ? (
          <MyLeaveRequestTab
            scheduleId={leaveScheduleId}
            weekStartDate={preferenceSchedule!.weekStartDate}
            shifts={leaveShifts}
            scheduleIsDraft={preferenceSchedule?.status === SCHEDULE_STATUS.Draft}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có lịch tuần cho phòng ban của bạn.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
