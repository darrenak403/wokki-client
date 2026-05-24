import { LoginForm } from "@/app/(auth)/login/components/LoginForm";
import { AuthFormShell } from "@/app/(auth)/components/AuthFormShell";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản Wokki của bạn.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <AuthFormShell title="Đăng nhập">
      <LoginForm />
    </AuthFormShell>
  );
}
