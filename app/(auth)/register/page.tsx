import { RegisterForm } from "@/app/(auth)/register/components/RegisterForm";
import { AuthFormShell } from "@/app/(auth)/components/AuthFormShell";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đăng ký",
  description: "Tạo tài khoản Wokki mới.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <AuthFormShell
      title="Đăng ký"
      description="Tạo tài khoản mới. Sau khi đăng ký, đăng nhập để bắt đầu sử dụng Wokki."
    >
      <RegisterForm />
    </AuthFormShell>
  );
}
