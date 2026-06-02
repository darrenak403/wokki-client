"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateOrgSubscriptionMutation } from "@/hooks/usePlatformOrganizations";
import type { PlatformOrganizationResponse } from "@/types/platform";
import { mapAuthError } from "@/lib/support/auth/map-auth-error";

type PlatformOrgSubscriptionDialogProps = {
  org: PlatformOrganizationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PlatformOrgSubscriptionDialog({
  org,
  open,
  onOpenChange,
}: PlatformOrgSubscriptionDialogProps) {
  const mutation = useUpdateOrgSubscriptionMutation();
  const [enabled, setEnabled] = useState(true);
  const [durationDays, setDurationDays] = useState("");

  useEffect(() => {
    if (!org) return;
    setEnabled(org.subscriptionStatus !== "Disabled");
    setDurationDays(
      org.subscriptionDurationDays > 0 ? String(org.subscriptionDurationDays) : ""
    );
  }, [org]);

  const handleSave = async () => {
    if (!org) return;

    const trimmedDuration = durationDays.trim();
    const days = trimmedDuration ? Number.parseInt(trimmedDuration, 10) : null;
    if (enabled && days == null && org.subscriptionDurationDays < 1) {
      toast.error("Org chưa có thời hạn lưu sẵn. Nhập số ngày để kích hoạt.");
      return;
    }
    if (enabled && days != null && (Number.isNaN(days) || days < 1 || days > 3650)) {
      toast.error("Nhập số ngày từ 1 đến 3650.");
      return;
    }

    try {
      await mutation.mutateAsync({
        organizationId: org.id,
        body: enabled ? { enabled: true, durationDays: days } : { enabled: false },
      });
      toast.success(
        enabled
          ? `Đã cập nhật gói cho ${org.name}`
          : `Đã tắt gói ${org.name}`
      );
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(mapAuthError(error));
    }
  };

  const expiresLabel =
    org?.subscriptionExpiresAt != null
      ? format(parseISO(org.subscriptionExpiresAt), "dd/MM/yyyy HH:mm", { locale: vi })
      : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gói sử dụng — {org?.name ?? ""}</DialogTitle>
          <DialogDescription>
            Wokki admin chọn thời hạn sử dụng cho org. Cập nhật thành công sẽ ghi ledger và audit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="sub-enabled">Bật gói</Label>
            <Switch id="sub-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled ? (
            <div className="space-y-2">
              <Label htmlFor="sub-days">Số ngày sử dụng</Label>
              <Input
                id="sub-days"
                type="number"
                min={1}
                max={3650}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="vd. 50"
              />
              <p className="text-xs text-muted-foreground">
                Để trống để dùng lại thời hạn đang lưu nếu backend cho phép.
              </p>
            </div>
          ) : null}

          <p className="text-sm text-muted-foreground">
            Hết hạn hiện tại: <span className="font-medium text-foreground">{expiresLabel}</span>
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={mutation.isPending}>
            {mutation.isPending ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
