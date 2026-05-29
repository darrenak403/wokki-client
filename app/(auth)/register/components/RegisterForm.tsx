"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OrgPackageNoticeDialog } from "@/components/auth/org-package-notice-dialog";
import { useAuth } from "@/hooks/useAuth";
import { applyValidationErrors } from "@/lib/support/auth/validation-errors";
import { mapAuthError } from "@/lib/support/auth/map-auth-error";
import {
  isOrgPackageCode,
  orgPackageReasonFromCode,
  type OrgPackageReason,
} from "@/lib/support/auth/org-package";
import type { ApiError } from "@/types/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    organizationName: z.string().min(2, "Vui lòng nhập tên tổ chức"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerAccount, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [packageReason, setPackageReason] = useState<OrgPackageReason | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { organizationName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async ({ email, password, organizationName }) => {
    setSubmitError(null);
    setPackageReason(null);
    try {
      await registerAccount({ email, password, organizationName });
    } catch (error: unknown) {
      if (typeof error === "string" && isOrgPackageCode(error)) {
        setPackageReason(orgPackageReasonFromCode(error));
        return;
      }
      const apiError = error as ApiError;
      if (applyValidationErrors(form.setError, apiError.errors)) return;
      if (typeof error === "string") {
        setSubmitError(error);
        return;
      }
      setSubmitError(mapAuthError(error));
    }
  });

  return (
    <>
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="register-org">Tên quán / công ty của bạn</FieldLabel>
          <Input
            id="register-org"
            autoComplete="organization"
            placeholder="Cafe Sunrise"
            className="h-11"
            {...form.register("organizationName")}
          />
          <FieldError errors={[form.formState.errors.organizationName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="owner@cafe.vn"
            className="h-11"
            {...form.register("email")}
          />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="register-password">Mật khẩu</FieldLabel>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            className="h-11"
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="register-confirm">Xác nhận mật khẩu</FieldLabel>
          <Input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            className="h-11"
            {...form.register("confirmPassword")}
          />
          <FieldError errors={[form.formState.errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      {submitError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {submitError}
            {submitError.includes("Email") || submitError.includes("email") ? (
              <>
                {" "}
                <Link href="/login" className="underline">
                  Đăng nhập
                </Link>
              </>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={isLoading}>
        {isLoading ? "Đang xử lý…" : "Tạo tổ chức"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-blue underline-offset-4 hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </form>

    <OrgPackageNoticeDialog
      open={packageReason !== null}
      onOpenChange={(open) => {
        if (!open) setPackageReason(null);
      }}
      reason={packageReason ?? "not-activated"}
    />
    </>
  );
}
