import { LoginForm } from "@/app/(auth)/login/components/LoginForm";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản Wokki của bạn.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <main className="rounded-lg border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">
          Nhập email và mật khẩu để truy cập Wokki.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
