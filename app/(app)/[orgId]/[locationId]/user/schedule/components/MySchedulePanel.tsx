"use client";

import { MyLeaveRequestTab } from "@/app/(app)/[orgId]/[locationId]/user/schedule/components/MyLeaveRequestTab";
import { MyPreferencesTab } from "@/app/(app)/[orgId]/[locationId]/user/schedule/components/MyPreferencesTab";
import { NoEmployeeLinked } from "@/app/(app)/[orgId]/[locationId]/user/components/NoEmployeeLinked";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployeePreferenceScheduleQuery } from "@/hooks/useSchedulePreferences";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { addWeeksISO, toMondayISO } from "@/lib/support/schedule/week";
import type { ApiError } from "@/types/api";
import { SCHEDULE_STATUS } from "@/types/schedule";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDaysIcon } from "lucide-react";
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
    [preferenceSchedule?.shifts],
  );

  if (noEmployee) {
    return <NoEmployeeLinked />;
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList className="h-9 max-w-full overflow-x-auto">
          <TabsTrigger value="published" className="shrink-0">
            Lịch đã công bố
          </TabsTrigger>
          <TabsTrigger value="preferences" className="shrink-0">
            Đăng ký ca
          </TabsTrigger>
          <TabsTrigger value="leave" className="shrink-0">
            Xin nghỉ
          </TabsTrigger>
        </TabsList>
        {tab === "published" ? (
          <Badge variant="outline" className="h-9 shrink-0 gap-2 rounded-lg px-3 text-sm">
            <CalendarDaysIcon className="size-4 text-primary" aria-hidden />
            {format(new Date(), "MMMM yyyy", { locale: vi })}
          </Badge>
        ) : null}
      </div>
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
