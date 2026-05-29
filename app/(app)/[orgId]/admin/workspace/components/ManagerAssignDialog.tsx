"use client";

import { useMemo, useState } from "react";
import { UserPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignLocationManagerMutation } from "@/hooks/useLocationManagers";
import { useUsersQuery } from "@/hooks/useUsers";
import { mapFoundationError } from "@/lib/support/foundation/map-errors";
import { ROLE_MANAGER } from "@/lib/types/roles";

type ManagerAssignDialogProps = {
  assignedUserIds?: string[];
  locationId: string;
  locationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManagerAssignDialog({
  assignedUserIds = [],
  locationId,
  locationName,
  open,
  onOpenChange,
}: ManagerAssignDialogProps) {
  const [userId, setUserId] = useState("");
  const usersQuery = useUsersQuery({ page: 1, pageSize: 100 });
  const assignMutation = useAssignLocationManagerMutation(locationId);

  const assignedSet = useMemo(() => new Set(assignedUserIds), [assignedUserIds]);
  const managerUsers = useMemo(
    () =>
      (usersQuery.data?.items ?? []).filter(
        (user) => user.role === ROLE_MANAGER && !assignedSet.has(user.id)
      ),
    [assignedSet, usersQuery.data?.items]
  );
  const listError = usersQuery.isError ? mapFoundationError(usersQuery.error) : null;

  const close = () => {
    onOpenChange(false);
    setUserId("");
  };

  const handleSubmit = async () => {
    if (!userId) return;
    try {
      await assignMutation.mutateAsync({ locationId, data: { userId } });
      close();
    } catch {
      // The hook maps API errors to Vietnamese toasts.
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gán Manager cho chi nhánh</DialogTitle>
          <DialogDescription>
            Manager được gán ở đây mới có quyền quản lý dữ liệu của {locationName}.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="location-manager-user">Tài khoản Manager</FieldLabel>
            {usersQuery.isLoading ? (
              <Skeleton className="h-8 w-full" aria-label="Đang tải tài khoản Manager" />
            ) : (
              <Select
                value={userId}
                onValueChange={(value) => setUserId(value ?? "")}
                disabled={assignMutation.isPending || managerUsers.length === 0}
              >
                <SelectTrigger id="location-manager-user" className="w-full">
                  <SelectValue
                    placeholder={
                      managerUsers.length === 0
                        ? "Không có Manager khả dụng"
                        : "Chọn tài khoản Manager"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {managerUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            <FieldDescription>
              Danh sách này lấy tối đa 100 tài khoản và chỉ hiển thị role Manager chưa được gán.
            </FieldDescription>
          </Field>
        </FieldGroup>

        {listError ? (
          <p className="text-sm text-destructive" role="alert">
            {listError}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={assignMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={!userId || usersQuery.isLoading || assignMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            <UserPlusIcon data-icon="inline-start" aria-hidden="true" />
            {assignMutation.isPending ? "Đang gán..." : "Gán Manager"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
