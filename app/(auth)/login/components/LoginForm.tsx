"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OrgPackageNoticeDialog } from "@/components/auth/org-package-notice-dialog";
import { ForgotPasswordPanel } from "@/components/auth/forgot-auth-panel";
import { useAuth } from "@/hooks/useAuth";
import { getPostLoginPath } from "@/lib/support/auth/post-login-route";
import { readFoundationSession } from "@/lib/support/foundation/session-context";
import {
  isOrgPackageCode,
  orgPackageReasonFromCode,
  type OrgPackageReason,
} from "@/lib/support/auth/org-package";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated, role, organizationId } = useAuth();
  const [packageReason, setPackageReason] = useState<OrgPackageReason | null>(null);
  const [mode, setMode] = useState<"login" | "forgot">("login");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isAuthenticated || !role || packageReason) return;
    const branchId = readFoundationSession().selectedLocationId;
    router.replace(getPostLoginPath(role, organizationId, branchId));
  }, [isAuthenticated, role, organizationId, router, packageReason]);

  const onSubmit = form.handleSubmit(async (values) => {
    clearError();
    setPackageReason(null);
    try {
      await login(values);
    } catch (message: unknown) {
      if (typeof message === "string" && isOrgPackageCode(message)) {
        setPackageReason(orgPackageReasonFromCode(message));
      }
    }
  });

  if (mode === "forgot") {
    return (
      <ForgotPasswordPanel
        onBackToLogin={() => {
          clearError();
          setMode("login");
        }}
      />
    );
  }

  return (
    <>
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
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
              <button
                type="button"
                className="text-sm font-medium text-brand-blue underline-offset-4 hover:underline"
                onClick={() => {
                  clearError();
                  setMode("forgot");
                }}
              >
                Quên mật khẩu?
              </button>
            </div>
            <MaskedInput
              id="password"
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
            Tạo tổ chức mới
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
