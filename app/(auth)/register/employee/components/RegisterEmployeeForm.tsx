"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { applyValidationErrors } from "@/lib/support/auth/validation-errors";
import { mapAuthError } from "@/lib/support/auth/map-auth-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import type { ApiError } from "@/types/api";

const schema = z
  .object({
    firstName: z.string().min(1, "Vui lòng nhập họ"),
    lastName: z.string().min(1, "Vui lòng nhập tên"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().max(32).optional(),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterEmployeeForm() {
  const { registerEmployee, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await registerEmployee({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone?.trim() || undefined,
      });
    } catch (error: unknown) {
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
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="firstName">Họ</FieldLabel>
            <Input id="firstName" className="h-11" {...form.register("firstName")} />
            <FieldError errors={[form.formState.errors.firstName]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Tên</FieldLabel>
            <Input id="lastName" className="h-11" {...form.register("lastName")} />
            <FieldError errors={[form.formState.errors.lastName]} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="employee-email">Email</FieldLabel>
          <Input
            id="employee-email"
            type="email"
            autoComplete="email"
            className="h-11"
            {...form.register("email")}
          />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="employee-phone">Số điện thoại (tuỳ chọn)</FieldLabel>
          <Input id="employee-phone" className="h-11" {...form.register("phone")} />
          <FieldError errors={[form.formState.errors.phone]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="employee-password">Mật khẩu</FieldLabel>
          <MaskedInput
            id="employee-password"
            autoComplete="new-password"
            className="h-11"
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="employee-confirm">Xác nhận mật khẩu</FieldLabel>
          <MaskedInput
            id="employee-confirm"
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
            {submitError.toLowerCase().includes("email") ? (
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
        {isLoading ? "Đang xử lý…" : "Đăng ký"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/register" className="underline-offset-4 hover:underline">
          ← Quay lại lựa chọn
        </Link>
      </p>
    </form>
  );
}
