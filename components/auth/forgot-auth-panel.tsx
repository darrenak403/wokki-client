"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { z } from "zod";
import { toast } from "sonner";
import { fetchAuth } from "@/lib/api/services/fetchAuth";
import { mapAuthError, mapAuthResponseFailure } from "@/lib/support/auth/map-auth-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { MaskedInput } from "@/components/ui/masked-input";

const otpSlotClassName = "size-11 text-base";

const emailSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const otpSchema = z.object({
  otpCode: z
    .string()
    .min(6, "Nhập đủ 6 số")
    .max(6, "Mã OTP gồm 6 số")
    .regex(/^\d{6}$/, "Mã OTP chỉ gồm số"),
});

const newSecretSchema = z
  .object({
    newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
    confirmNewPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

type Step = "email" | "otp" | "new-secret";

type ForgotPasswordPanelProps = {
  onBackToLogin: () => void;
};

export function ForgotPasswordPanel({ onBackToLogin }: ForgotPasswordPanelProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: "" },
  });

  const secretForm = useForm<z.infer<typeof newSecretSchema>>({
    resolver: zodResolver(newSecretSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const sendOtp = async (targetEmail: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchAuth.forgotPassword({ email: targetEmail.trim() });
      if (!response.success) {
        setError(mapAuthResponseFailure(response));
        return false;
      }
      setResendSeconds(60);
      toast.success("Nếu email tồn tại, mã OTP đã được gửi.");
      return true;
    } catch (err) {
      setError(mapAuthError(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEmailSubmit = emailForm.handleSubmit(async (values) => {
    const normalized = values.email.trim().toLowerCase();
    const ok = await sendOtp(normalized);
    if (!ok) return;
    setEmail(normalized);
    setStep("otp");
  });

  const onOtpSubmit = otpForm.handleSubmit(async (values) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchAuth.verifyForgotPasswordOtp({
        email,
        otpCode: values.otpCode.trim(),
      });
      if (!response.success) {
        setError(mapAuthResponseFailure(response));
        return;
      }
      toast.success("Xác minh OTP thành công");
      setStep("new-secret");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  });

  const onSecretSubmit = secretForm.handleSubmit(async (values) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchAuth.completeForgotPassword({
        email,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
      if (!response.success) {
        setError(mapAuthResponseFailure(response));
        return;
      }
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
      onBackToLogin();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Quên mật khẩu</h2>
        <p className="text-sm text-muted-foreground">
          {step === "email" && "Nhập email để nhận mã OTP (hiệu lực 1 phút)."}
          {step === "otp" && `Nhập mã OTP đã gửi tới ${email}.`}
          {step === "new-secret" && "Đặt mật khẩu mới cho tài khoản."}
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {step === "email" ? (
        <form onSubmit={onEmailSubmit} className="space-y-4" noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                className="h-11"
                {...emailForm.register("email")}
              />
              <FieldError errors={[emailForm.formState.errors.email]} />
            </Field>
          </FieldGroup>
          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi…" : "Gửi mã OTP"}
          </Button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={onOtpSubmit} className="space-y-4" noValidate>
          <FieldGroup>
            <Field data-invalid={!!otpForm.formState.errors.otpCode}>
              <FieldLabel htmlFor="forgot-otp">Mã OTP (6 số)</FieldLabel>
              <Controller
                control={otpForm.control}
                name="otpCode"
                render={({ field }) => (
                  <InputOTP
                    id="forgot-otp"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    autoComplete="one-time-code"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    containerClassName="justify-center"
                    aria-invalid={!!otpForm.formState.errors.otpCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className={otpSlotClassName} />
                      <InputOTPSlot index={1} className={otpSlotClassName} />
                      <InputOTPSlot index={2} className={otpSlotClassName} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className={otpSlotClassName} />
                      <InputOTPSlot index={4} className={otpSlotClassName} />
                      <InputOTPSlot index={5} className={otpSlotClassName} />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              <FieldError errors={[otpForm.formState.errors.otpCode]} />
            </Field>
          </FieldGroup>
          <div className="flex gap-2">
            <Button type="submit" className="h-11 flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Đang xác minh…" : "Xác minh"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 shrink-0"
              disabled={isSubmitting || resendSeconds > 0}
              onClick={() => void sendOtp(email)}
            >
              {resendSeconds > 0 ? `${resendSeconds}s` : "Gửi lại"}
            </Button>
          </div>
        </form>
      ) : null}

      {step === "new-secret" ? (
        <form onSubmit={onSecretSubmit} className="space-y-4" noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="forgot-new">Mật khẩu mới</FieldLabel>
              <MaskedInput
                id="forgot-new"
                autoComplete="new-password"
                className="h-11"
                {...secretForm.register("newPassword")}
              />
              <FieldError errors={[secretForm.formState.errors.newPassword]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="forgot-confirm">Xác nhận mật khẩu</FieldLabel>
              <MaskedInput
                id="forgot-confirm"
                autoComplete="new-password"
                className="h-11"
                {...secretForm.register("confirmNewPassword")}
              />
              <FieldError errors={[secretForm.formState.errors.confirmNewPassword]} />
            </Field>
          </FieldGroup>
          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu…" : "Đặt lại mật khẩu"}
          </Button>
        </form>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        <button
          type="button"
          className="font-semibold text-brand-blue underline-offset-4 hover:underline"
          onClick={onBackToLogin}
        >
          ← Quay lại đăng nhập
        </button>
      </p>
    </div>
  );
}
