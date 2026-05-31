"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDepartmentsQuery } from "@/hooks/useDepartments";
import { useCopyShiftsMutation } from "@/hooks/useShifts";
import type { ShiftDefinitionResponse, ShiftListParams } from "@/types/foundation";

type CopyShiftsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: string;
  sourceDepartmentId: string;
  sourceDepartmentName: string;
  activeShifts: ShiftDefinitionResponse[];
  listParams: ShiftListParams;
};

export function CopyShiftsDialog({
  open,
  onOpenChange,
  locationId,
  sourceDepartmentId,
  sourceDepartmentName,
  activeShifts,
  listParams,
}: CopyShiftsDialogProps) {
  const { data: departments = [], isLoading } = useDepartmentsQuery(locationId);
  const copyMutation = useCopyShiftsMutation(listParams);
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setSelectedTargetIds([]);
  }, [open, sourceDepartmentId]);

  useEffect(() => {
    setSelectedTargetIds((prev) => prev.filter((id) => id !== sourceDepartmentId));
  }, [sourceDepartmentId]);

  const targetDepartments = useMemo(
    () => departments.filter((dept) => dept.id !== sourceDepartmentId),
    [departments, sourceDepartmentId]
  );

  const activeCount = useMemo(
    () => activeShifts.filter((shift) => shift.isActive && shift.departmentId === sourceDepartmentId).length,
    [activeShifts, sourceDepartmentId]
  );

  const toggleTarget = (departmentId: string, checked: boolean) => {
    setSelectedTargetIds((prev) =>
      checked ? [...prev, departmentId] : prev.filter((id) => id !== departmentId)
    );
  };

  const handleSubmit = async () => {
    const targetDepartmentIds = selectedTargetIds.filter((id) => id !== sourceDepartmentId);
    if (targetDepartmentIds.length === 0) return;
    await copyMutation.mutateAsync({
      locationId,
      sourceDepartmentId,
      targetDepartmentIds,
    });
    setSelectedTargetIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelectedTargetIds([]);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CopyIcon className="size-4 opacity-70" aria-hidden="true" />
            Sao chép ca làm việc
          </DialogTitle>
          <DialogDescription>
            Sao chép ca đang hoạt động từ <strong>{sourceDepartmentName}</strong> sang các phòng ban
            khác trong cùng chi nhánh. Ca trùng tên và khung giờ sẽ được bỏ qua.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            Sẽ sao chép <strong>{activeCount}</strong> ca đang hoạt động.
          </p>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải phòng ban…</p>
          ) : targetDepartments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Không có phòng ban đích khác trong chi nhánh này.
            </p>
          ) : (
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Phòng ban đích</p>
              {targetDepartments.map((dept) => {
                const checked = selectedTargetIds.includes(dept.id);
                return (
                  <div key={dept.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`copy-target-${dept.id}`}
                      checked={checked}
                      onCheckedChange={(value) => toggleTarget(dept.id, Boolean(value))}
                    />
                    <Label htmlFor={`copy-target-${dept.id}`} className="cursor-pointer font-normal">
                      {dept.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={
              copyMutation.isPending ||
              selectedTargetIds.filter((id) => id !== sourceDepartmentId).length === 0 ||
              activeCount === 0 ||
              targetDepartments.length === 0
            }
            onClick={() => void handleSubmit()}
          >
            {copyMutation.isPending ? "Đang sao chép…" : "Sao chép ca"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
