"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { fetchAuth } from "@/lib/api/services/fetchAuth";
import { mapAuthError, mapAuthResponseFailure } from "@/lib/support/auth/map-auth-error";
import { useAppDispatch } from "@/lib/redux/hooks";
import { clearMustChangePassword } from "@/lib/redux/slices/authSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { MaskedInput } from "@/components/ui/masked-input";
import { cn } from "@/lib/utils";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự"),
    confirmNewPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

type AccountSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string | null;
  /** Bắt buộc đổi MK sau đăng nhập — không cho đóng dialog */
  required?: boolean;
};

export function AccountSettingsDialog({
  open,
  onOpenChange,
  userEmail,
  required = false,
}: AccountSettingsDialogProps) {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (required && !next) return;
    onOpenChange(next);
    if (!next) {
      form.reset();
      setError(null);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchAuth.resetPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
      if (!response.success) {
        setError(mapAuthResponseFailure(response));
        return;
      }
      dispatch(clearMustChangePassword());
      toast.success("Đổi mật khẩu thành công");
      form.reset();
      onOpenChange(false);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-2xl"
        showCloseButton={!required}
      >
        <DialogTitle className="sr-only">Cài đặt tài khoản</DialogTitle>
        <DialogDescription className="sr-only">
          Đổi mật khẩu tài khoản Wokki
        </DialogDescription>

        <div className="flex min-h-[420px] flex-col sm:flex-row">
          {/* Sidebar — Zalo-style */}
          <aside className="border-b border-neutral-200 bg-neutral-50 px-4 py-5 sm:w-52 sm:border-r sm:border-b-0 dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="mb-4 flex items-center justify-between gap-2 sm:block">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Cài đặt
              </h2>
              {required ? (
                <button
                  type="button"
                  className="rounded-lg p-1 text-muted-foreground sm:hidden"
                  aria-label="Đóng"
                  disabled
                >
                  <XIcon className="size-4 opacity-40" />
                </button>
              ) : null}
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium",
                  "bg-[#EEF6FB] text-[#1D4D8F] dark:bg-[#0B1E3D] dark:text-[#BCE8F5]"
                )}
              >
                <ShieldIcon className="size-4 shrink-0" />
                Tài khoản & bảo mật
              </button>
            </nav>
            {userEmail ? (
              <p className="mt-6 hidden truncate text-xs text-muted-foreground sm:block">
                {userEmail}
              </p>
            ) : null}
          </aside>

          {/* Main panel */}
          <div className="flex flex-1 flex-col bg-neutral-100/80 p-5 dark:bg-neutral-950/40 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Đổi mật khẩu
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {required
                  ? "Bạn cần đổi mật khẩu tạm trước khi tiếp tục sử dụng Wokki."
                  : "Cập nhật mật khẩu đăng nhập của bạn."}
              </p>
            </div>

            {error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <form onSubmit={onSubmit} className="flex flex-1 flex-col">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel htmlFor="current-password">Mật khẩu hiện tại</FieldLabel>
                    <MaskedInput
                      id="current-password"
                      autoComplete="current-password"
                      className="h-10"
                      {...form.register("currentPassword")}
                    />
                    <FieldError errors={[form.formState.errors.currentPassword]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-password">Mật khẩu mới</FieldLabel>
                    <MaskedInput
                      id="new-password"
                      autoComplete="new-password"
                      className="h-10"
                      {...form.register("newPassword")}
                    />
                    <FieldError errors={[form.formState.errors.newPassword]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">Xác nhận mật khẩu mới</FieldLabel>
                    <MaskedInput
                      id="confirm-password"
                      autoComplete="new-password"
                      className="h-10"
                      {...form.register("confirmNewPassword")}
                    />
                    <FieldError errors={[form.formState.errors.confirmNewPassword]} />
                  </Field>
                </FieldGroup>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                {!required ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                ) : null}
                <Button type="submit" disabled={isSubmitting} data-save>
                  {isSubmitting ? "Đang lưu…" : "Cập nhật mật khẩu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
