import Link from "next/link";
import { SITE_NAV } from "@/components/shared/site-nav";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:items-start md:justify-between md:px-10">
        <div className="max-w-sm space-y-2">
          <p className="text-lg font-semibold text-foreground">Wokki</p>
          <p className="text-sm text-muted-foreground">
            Lịch ca, chấm công và giao tiếp đội ngũ — một nền tảng cho doanh nghiệp vận hành theo
            ca.
          </p>
        </div>

        <div className="flex flex-wrap gap-10 text-sm">
          <div className="space-y-2">
            <p className="font-medium text-foreground">Trang</p>
            <ul className="space-y-1 text-muted-foreground">
              {SITE_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Tài khoản</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground">
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-6 py-4 text-center text-xs text-muted-foreground md:px-10 md:text-left">
          © {year} Wokki. Bảo lưu mọi quyền.
        </p>
      </div>
    </footer>
  );
}
