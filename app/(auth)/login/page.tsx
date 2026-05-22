import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function LoginPage() {
  return (
    <main className="rounded-lg border border-border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Trang đăng nhập — kết nối form với <code className="text-xs">useAuth()</code>.
      </p>
      <p className="mt-6 text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Đăng ký
        </Link>
      </p>
    </main>
  );
}
