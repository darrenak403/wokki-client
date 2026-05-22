import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đăng ký",
  description: "Tạo tài khoản Wokki mới.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <main className="rounded-lg border border-border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Đăng ký</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Trang đăng ký — kết nối form với <code className="text-xs">fetchAuth.register</code>.
      </p>
      <p className="mt-6 text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </main>
  );
}
