"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { fetchAuth } from "@/lib/api/services/fetchAuth";
import { mapAuthError, mapAuthResponseFailure } from "@/lib/support/auth/map-auth-error";
import { applyValidationErrors } from "@/lib/support/auth/validation-errors";
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
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchAuth.register({ email, password });

      if (!response.success) {
        if (applyValidationErrors(form.setError, response.errors)) return;
        setSubmitError(mapAuthResponseFailure(response));
        return;
      }

      toast.success("Đăng ký thành công. Vui lòng đăng nhập để tiếp tục.");
      router.push("/login");
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (applyValidationErrors(form.setError, apiError.errors)) return;
      setSubmitError(mapAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
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
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={isSubmitting}>
        {isSubmitting ? "Đang xử lý…" : "Đăng ký"}
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
  );
}
