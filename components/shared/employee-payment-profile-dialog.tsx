"use client";

import { CopyIcon, LandmarkIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildPaymentProfileCopyText,
  hasEmployeePaymentProfile,
  type EmployeePaymentProfileFields,
} from "@/lib/support/employee/payment-profile";

type EmployeePaymentProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  profile: EmployeePaymentProfileFields;
};

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-4 py-2.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium break-all">{value}</p>
    </div>
  );
}

export function EmployeePaymentProfileDialog({
  open,
  onOpenChange,
  employeeName,
  profile,
}: EmployeePaymentProfileDialogProps) {
  const configured = hasEmployeePaymentProfile(profile);

  const copyAll = async () => {
    const text = buildPaymentProfileCopyText(employeeName, profile);
    await navigator.clipboard.writeText(text);
    toast.success("Đã sao chép thông tin thanh toán");
  };

  const copyAccountNumber = async () => {
    if (!profile.bankAccountNumber?.trim()) return;
    await navigator.clipboard.writeText(profile.bankAccountNumber.trim());
    toast.success("Đã sao chép số tài khoản");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LandmarkIcon className="size-4 opacity-70" aria-hidden="true" />
            Tài khoản nhận lương
          </DialogTitle>
          <DialogDescription>
            {employeeName} — thông tin do nhân viên tự cập nhật trong Cài đặt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Badge variant={configured ? "default" : "outline"}>
            {configured ? "Đã thiết lập" : "Chưa thiết lập"}
          </Badge>

          {configured ? (
            <>
              {profile.bankName?.trim() ? (
                <ReadOnlyField label="Ngân hàng" value={profile.bankName.trim()} />
              ) : null}
              {profile.bankAccountHolderName?.trim() ? (
                <ReadOnlyField label="Chủ tài khoản" value={profile.bankAccountHolderName.trim()} />
              ) : null}
              {profile.bankAccountNumber?.trim() ? (
                <div className="space-y-2">
                  <ReadOnlyField label="Số tài khoản" value={profile.bankAccountNumber.trim()} />
                  <Button type="button" variant="outline" size="sm" onClick={() => void copyAccountNumber()}>
                    <CopyIcon data-icon="inline-start" aria-hidden="true" />
                    Sao chép STK
                  </Button>
                </div>
              ) : null}
              {profile.paymentQrImageUrl ? (
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Ảnh QR chuyển khoản</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.paymentQrImageUrl}
                    alt={`QR chuyển khoản — ${employeeName}`}
                    className="mx-auto max-h-48 rounded-lg border bg-white object-contain"
                  />
                </div>
              ) : null}
            </>
          ) : (
            <p className="rounded-xl bg-muted/60 px-4 py-3.5 text-sm leading-relaxed text-muted-foreground">
              Nhân viên chưa cập nhật STK hoặc ảnh QR. Hướng dẫn họ vào Cài đặt → Hồ sơ cá nhân → Tài
              khoản nhận lương.
            </p>
          )}
        </div>

        <DialogFooter>
          {configured ? (
            <Button type="button" variant="outline" onClick={() => void copyAll()}>
              <CopyIcon data-icon="inline-start" aria-hidden="true" />
              Sao chép tất cả
            </Button>
          ) : null}
          <Button type="button" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
