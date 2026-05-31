"use client";

import { CopyIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatVnd } from "@/lib/support/payroll/month";
import type { PayrollLineResponse } from "@/types/payroll";
import { toast } from "sonner";

type PayrollPayoutDialogProps = {
  line: PayrollLineResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`Đã copy ${label}.`);
  } catch {
    toast.error("Không copy được.");
  }
}

export function PayrollPayoutDialog({ line, open, onOpenChange }: PayrollPayoutDialogProps) {
  if (!line) return null;

  const employeeName = `${line.lastName} ${line.firstName}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chuyển lương — {employeeName}</DialogTitle>
          <DialogDescription>
            Dùng app ngân hàng của bạn để chuyển khoản. Wokki không xử lý thanh toán trực tiếp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 p-4 text-center">
            <p className="text-xs uppercase text-muted-foreground">Số tiền cần chuyển</p>
            <p className="text-2xl font-semibold tabular-nums">{formatVnd(line.grossPay)}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => void copyText("số tiền", String(Math.round(line.grossPay)))}
            >
              <CopyIcon className="mr-1 size-3.5" />
              Copy số tiền
            </Button>
          </div>

          {(line.bankAccountNumber || line.bankName) && (
            <div className="space-y-1 text-sm">
              {line.bankName ? <p>Ngân hàng: {line.bankName}</p> : null}
              {line.bankAccountHolderName ? <p>Chủ TK: {line.bankAccountHolderName}</p> : null}
              {line.bankAccountNumber ? (
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">STK: {line.bankAccountNumber}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => void copyText("STK", line.bankAccountNumber!)}
                  >
                    <CopyIcon className="size-3.5" />
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          {line.paymentQrImageUrl ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground">QR nhận lương (từ profile NV)</p>
              <div className="relative size-48 overflow-hidden rounded-lg border">
                <Image
                  src={line.paymentQrImageUrl}
                  alt={`QR ${employeeName}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nhân viên chưa upload QR nhận lương.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
