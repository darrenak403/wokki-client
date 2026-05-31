"use client";

import { useState } from "react";
import { Trash2Icon, UserPlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useLocationManagersQuery,
  useRemoveLocationManagerMutation,
} from "@/hooks/useLocationManagers";
import { mapMembershipError } from "@/lib/support/membership/map-errors";
import { ManagerAssignDialog } from "./ManagerAssignDialog";

type LocationManagersSectionProps = {
  canAssignManagers?: boolean;
  locationId: string | null;
  locationName?: string;
};

function formatAssignedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function ManagerRowsSkeleton() {
  return (
    <>
      {[0, 1].map((row) => (
        <TableRow key={row}>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end">
              <Skeleton className="h-7 w-16" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function LocationManagersSection({
  canAssignManagers = false,
  locationId,
  locationName = "chi nhánh này",
}: LocationManagersSectionProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const managersQuery = useLocationManagersQuery(locationId, canAssignManagers);
  const removeMutation = useRemoveLocationManagerMutation(locationId);
  const managers = managersQuery.data ?? [];
  const listError = managersQuery.isError ? mapMembershipError(managersQuery.error) : null;

  if (!canAssignManagers) {
    return null;
  }

  const handleRemove = async (manager: (typeof managers)[number]) => {
    try {
      await removeMutation.mutateAsync({
        locationId: manager.locationId,
        userId: manager.userId,
      });
    } catch {
      // The hook maps API errors to Vietnamese toasts.
    }
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="location-managers-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="location-managers-title" className="text-base font-medium">
            Manager chi nhánh
          </h2>
          <p className="text-sm text-muted-foreground">
            Chỉ Admin gán hoặc gỡ Manager. Manager chỉ thấy dữ liệu các chi nhánh được gán.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{managers.length} Manager</Badge>
          <Button
            type="button"
            size="sm"
            disabled={!locationId}
            onClick={() => setAssignOpen(true)}
          >
            <UserPlusIcon data-icon="inline-start" aria-hidden="true" />
            Gán Manager
          </Button>
        </div>
      </div>

      {listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Ngày gán</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managersQuery.isLoading ? (
              <ManagerRowsSkeleton />
            ) : !locationId ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Chọn chi nhánh để xem Manager.
                </TableCell>
              </TableRow>
            ) : managers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Chưa có Manager nào được gán cho chi nhánh này.
                </TableCell>
              </TableRow>
            ) : (
              managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell className="font-medium">{manager.userEmail}</TableCell>
                  <TableCell>{formatAssignedAt(manager.assignedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={removeMutation.isPending}
                        onClick={() => void handleRemove(manager)}
                      >
                        <Trash2Icon data-icon="inline-start" aria-hidden="true" />
                        Gỡ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {assignOpen && locationId ? (
        <ManagerAssignDialog
          assignedUserIds={managers.map((manager) => manager.userId)}
          locationId={locationId}
          locationName={locationName}
          open={assignOpen}
          onOpenChange={setAssignOpen}
        />
      ) : null}
    </section>
  );
}
