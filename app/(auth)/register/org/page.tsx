import { RegisterForm } from "@/app/(auth)/register/components/RegisterForm";
import { AuthFormShell } from "@/app/(auth)/components/AuthFormShell";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đăng ký tổ chức",
  description: "Tạo tổ chức mới trên Wokki.",
  path: "/register/org",
});

export default function RegisterOrgPage() {
  return (
    <AuthFormShell title="Tạo tổ chức mới">
      <RegisterForm />
    </AuthFormShell>
  );
}
