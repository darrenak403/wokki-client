"use client";

import { MyPreferencesTab } from "@/app/(app)/[orgId]/[locationId]/user/schedule/components/MyPreferencesTab";
import { NoEmployeeLinked } from "@/app/(app)/[orgId]/[locationId]/user/components/NoEmployeeLinked";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import type { ApiError } from "@/types/api";
import { MyPublishedScheduleView } from "./MyPublishedScheduleView";

export function MySchedulePanel() {
  const { isError, error } = useMyScheduleQuery();
  const errorCode =
    isError && error && typeof error === "object" && "messageCode" in error
      ? (error as unknown as ApiError).messageCode
      : undefined;
  const noEmployee = errorCode === "ME_NO_EMPLOYEE";

  if (noEmployee) {
    return <NoEmployeeLinked />;
  }

  return (
    <Tabs defaultValue="published" className="space-y-6">
      <TabsList>
        <TabsTrigger value="published">Lịch đã công bố</TabsTrigger>
        <TabsTrigger value="preferences">Đăng ký ca</TabsTrigger>
      </TabsList>
      <TabsContent value="published" className="mt-4">
        <MyPublishedScheduleView />
      </TabsContent>
      <TabsContent value="preferences" className="mt-4">
        <MyPreferencesTab />
      </TabsContent>
    </Tabs>
  );
}
