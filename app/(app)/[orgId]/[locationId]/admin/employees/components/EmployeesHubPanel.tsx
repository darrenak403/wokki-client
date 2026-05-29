"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeesPanel } from "./EmployeesPanel";
import { UsersPanel } from "@/app/(app)/[orgId]/[locationId]/admin/users/components/UsersPanel";

export function EmployeesHubPanel() {
  return (
    <Tabs defaultValue="employees" className="flex flex-col gap-4">
      <TabsList>
        <TabsTrigger value="employees">Nhân viên</TabsTrigger>
        <TabsTrigger value="accounts">Tài khoản hệ thống</TabsTrigger>
      </TabsList>
      <TabsContent value="employees">
        <EmployeesPanel canWrite canTransfer />
      </TabsContent>
      <TabsContent value="accounts">
        <UsersPanel withoutEmployee />
      </TabsContent>
    </Tabs>
  );
}
