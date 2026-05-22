import { RegisterForm } from "@/app/(auth)/register/components/register-form";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đăng ký",
  description: "Tạo tài khoản Wokki mới.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <main className="rounded-lg border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Đăng ký</h1>
        <p className="text-sm text-muted-foreground">
          Tạo tài khoản mới. Sau khi đăng ký, đăng nhập để bắt đầu sử dụng Wokki.
        </p>
      </div>
      <RegisterForm />
    </main>
  );
}
