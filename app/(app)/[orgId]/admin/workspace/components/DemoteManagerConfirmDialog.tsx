"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangleIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { employeeDisplayName } from "@/app/(app)/[orgId]/admin/workspace/components/EmployeeTransferPanel";
import { PROMOTE_CONFIRM_TEXT } from "@/app/(app)/[orgId]/admin/workspace/components/PromoteManagerConfirmDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DepartmentSelect } from "@/components/shared/department-select";
import { LocationSelect } from "@/components/shared/location-select";
import { cn } from "@/lib/utils";
import type { EmployeeResponse } from "@/types/foundation";

type DemoteManagerConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeResponse;
  initialLocationId: string;
  initialDepartmentId: string;
  isPending: boolean;
  onConfirm: (departmentId: string) => void | Promise<void>;
};

export function DemoteManagerConfirmDialog({
  open,
  onOpenChange,
  employee,
  initialLocationId,
  initialDepartmentId,
  isPending,
  onConfirm,
}: DemoteManagerConfirmDialogProps) {
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [locationId, setLocationId] = useState(initialLocationId);
  const [departmentId, setDepartmentId] = useState(initialDepartmentId);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setConfirmPhrase("");
      return;
    }
    setLocationId(initialLocationId);
    setDepartmentId(initialDepartmentId);
    const id = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [open, initialLocationId, initialDepartmentId]);

  const matched = confirmPhrase.trim().toLowerCase() === PROMOTE_CONFIRM_TEXT;
  const displayName = employeeDisplayName(employee);
  const canConfirm = matched && Boolean(locationId) && Boolean(departmentId) && !isPending;

  const copyConfirmText = async () => {
    try {
      await navigator.clipboard.writeText(PROMOTE_CONFIRM_TEXT);
      toast.success("Đã sao chép.");
    } catch {
      toast.error("Không sao chép được. Hãy gõ yes thủ công.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className="gap-0 overflow-hidden p-0 sm:max-w-[28rem]"
      >
        <div className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              aria-hidden
            >
              <AlertTriangleIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <AlertDialogTitle className="text-base font-semibold leading-snug">
                Chuyển quản lý về nhân viên
              </AlertDialogTitle>
              <AlertDialogDescription className="sr-only">
                Xác nhận chuyển {displayName} về nhân viên phòng ban. Nhập {PROMOTE_CONFIRM_TEXT} để
                tiếp tục.
              </AlertDialogDescription>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">{displayName}</span> sẽ trở thành nhân
                viên tại phòng ban bạn chọn bên dưới.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-muted-foreground/80" aria-hidden>
                    •
                  </span>
                  <span>Gỡ quyền quản lý chi nhánh.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground/80" aria-hidden>
                    •
                  </span>
                  <span>Gán lại phòng ban và membership chi nhánh.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground/80" aria-hidden>
                    •
                  </span>
                  <span>Người này phải đăng nhập lại để cập nhật vai trò nhân viên.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border/80 bg-muted/30 p-4">
            <Field>
              <FieldLabel>Chi nhánh</FieldLabel>
              <LocationSelect
                value={locationId || null}
                onChange={(id) => {
                  setLocationId(id ?? "");
                  setDepartmentId("");
                }}
              />
            </Field>
            <Field>
              <FieldLabel>Phòng ban</FieldLabel>
              <DepartmentSelect
                locationId={locationId || null}
                value={departmentId || null}
                onChange={(id) => setDepartmentId(id ?? "")}
                allowEmpty={false}
              />
            </Field>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">Xác nhận thao tác</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Nhập</span>
              <kbd className="rounded border border-border bg-background px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                {PROMOTE_CONFIRM_TEXT}
              </kbd>
              <span>để tiếp tục</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 shrink-0"
                onClick={() => void copyConfirmText()}
                disabled={isPending}
              >
                <CopyIcon className="size-3.5" aria-hidden />
                Sao chép
              </Button>
            </div>
            <Input
              ref={inputRef}
              id="demote-confirm-input"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              placeholder={PROMOTE_CONFIRM_TEXT}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={isPending}
              className={cn(
                "mt-3 h-9 max-w-[10rem] font-mono text-sm",
                matched && "border-emerald-600/50 focus-visible:ring-emerald-600/25",
              )}
              aria-invalid={confirmPhrase.length > 0 && !matched}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canConfirm) {
                  e.preventDefault();
                  void onConfirm(departmentId);
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
          <AlertDialogCancel disabled={isPending} className="sm:min-w-[5.5rem]">
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm}
            className={cn(
              "sm:min-w-[9.5rem]",
              matched &&
                Boolean(departmentId) &&
                "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40",
            )}
            onClick={() => void onConfirm(departmentId)}
          >
            {isPending ? "Đang lưu…" : "Chuyển về nhân viên"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
