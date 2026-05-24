"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { decodeJwtPayload, readRoleFromPayload } from "@/lib/support/auth/jwt-roles";
import { normalizeAppRole } from "@/lib/support/auth/normalize-role";
import { getPostLoginPath } from "@/lib/support/auth/routing";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated, user, token, clearError } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isAuthenticated && !token) return;

    const role =
      normalizeAppRole(user?.role) ??
      (token ? readRoleFromPayload(decodeJwtPayload(token) ?? {}) : null);

    if (!role) return;

    router.replace(getPostLoginPath(role));
  }, [isAuthenticated, user?.role, token, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    clearError();
    await login(values);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            className="h-11"
            {...form.register("email")}
          />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-11"
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>
      </FieldGroup>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={isLoading}>
        {isLoading ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-blue underline-offset-4 hover:underline"
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
