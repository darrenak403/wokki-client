import { RegisterHub } from "@/app/(auth)/register/components/RegisterHub";
import { AuthFormShell } from "@/app/(auth)/components/AuthFormShell";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đăng ký",
  description: "Tạo tài khoản Wokki — tổ chức mới hoặc nhân viên.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <AuthFormShell title="Đăng ký">
      <RegisterHub />
    </AuthFormShell>
  );
}
