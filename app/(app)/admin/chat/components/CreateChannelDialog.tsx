"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateChannelMutation } from "@/hooks/useChat";
import { useEmployeesQuery } from "@/hooks/useEmployees";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { getCachedMyEmployeeId } from "@/lib/support/chat/my-employee-id";
import { CHANNEL_TYPE, type ChannelType } from "@/types/chat";

type CreateChannelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (channelId: string) => void;
};

export function CreateChannelDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateChannelDialogProps) {
  const { session } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;
  const createMutation = useCreateChannelMutation();

  const [channelType, setChannelType] = useState<ChannelType>(CHANNEL_TYPE.Direct);
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const myEmployeeId = getCachedMyEmployeeId();

  const { data: employeesData } = useEmployeesQuery({
    locationId: locationId ?? "",
    departmentId: departmentId ?? undefined,
    page: 1,
    pageSize: 200,
    includeTerminated: false,
  });

  const employees = useMemo(
    () =>
      (employeesData?.items ?? []).filter((e) => e.id !== myEmployeeId),
    [employeesData?.items, myEmployeeId],
  );

  const toggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (channelType === CHANNEL_TYPE.Direct) {
      if (selectedIds.length !== 1) return;
      const channel = await createMutation.mutateAsync({
        type: CHANNEL_TYPE.Direct,
        name: null,
        memberEmployeeIds: [selectedIds[0]],
      });
      onCreated(channel.id);
    } else {
      if (!groupName.trim() || selectedIds.length === 0) return;
      const channel = await createMutation.mutateAsync({
        type: CHANNEL_TYPE.Group,
        name: groupName.trim(),
        memberEmployeeIds: selectedIds,
      });
      onCreated(channel.id);
    }
    onOpenChange(false);
    setGroupName("");
    setSelectedIds([]);
  };

  const canSubmit =
    channelType === CHANNEL_TYPE.Direct
      ? selectedIds.length === 1
      : groupName.trim().length > 0 && selectedIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo kênh chat</DialogTitle>
        </DialogHeader>

        {!departmentId ? (
          <p className="text-sm text-muted-foreground">
            Chọn phòng ban trong session foundation trước khi tạo kênh.
          </p>
        ) : (
          <FieldGroup>
            <Field>
              <FieldLabel>Loại kênh</FieldLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={channelType === CHANNEL_TYPE.Direct ? "default" : "outline"}
                  onClick={() => {
                    setChannelType(CHANNEL_TYPE.Direct);
                    setSelectedIds([]);
                  }}
                >
                  Direct (1-1)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={channelType === CHANNEL_TYPE.Group ? "default" : "outline"}
                  onClick={() => setChannelType(CHANNEL_TYPE.Group)}
                >
                  Nhóm
                </Button>
              </div>
            </Field>

            {channelType === CHANNEL_TYPE.Group ? (
              <Field>
                <FieldLabel>Tên nhóm</FieldLabel>
                <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} />
              </Field>
            ) : null}

            <Field>
              <FieldLabel>
                {channelType === CHANNEL_TYPE.Direct
                  ? "Chọn đối tác (1 người)"
                  : "Thành viên"}
              </FieldLabel>
              <div className="max-h-48 overflow-y-auto rounded-lg border p-2 space-y-1">
                {employees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Không có nhân viên trong phòng ban.</p>
                ) : (
                  employees.map((emp) => {
                    const checked = selectedIds.includes(emp.id);
                    const disabled =
                      channelType === CHANNEL_TYPE.Direct &&
                      selectedIds.length === 1 &&
                      !checked;
                    return (
                      <label
                        key={emp.id}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleMember(emp.id)}
                        />
                        {emp.firstName} {emp.lastName}
                      </label>
                    );
                  })
                )}
              </div>
            </Field>
          </FieldGroup>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            disabled={!departmentId || !canSubmit || createMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {createMutation.isPending ? "Đang tạo…" : "Tạo kênh"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
