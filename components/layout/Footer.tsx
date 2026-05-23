import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  "Sản phẩm": [
    { name: "Tính năng", href: "/#blog" },
    { name: "Xếp ca thông minh", href: "/#van-de" },
    { name: "Bảng giá", href: "/#bang-gia" },
    { name: "Câu hỏi thường gặp", href: "/#cau-hoi" },
  ],
  "Công ty": [
    { name: "Về chúng tôi", href: "/about" },
    { name: "Cộng đồng", href: "/community" },
    { name: "Blog", href: "/#blog" },
  ],
  "Hỗ trợ": [
    { name: "Trung tâm trợ giúp", href: "/help" },
    { name: "Liên hệ", href: "/#dang-ky" },
    { name: "Chính sách bảo mật", href: "/help" },
    { name: "Điều khoản sử dụng", href: "/help" },
  ],
};

const industries = ["F&B", "Bán lẻ", "Dịch vụ", "Chuỗi cửa hàng"];

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
                Wokki
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Nền tảng quản lý nhân sự và xếp ca làm việc thông minh dành cho doanh nghiệp F&B,
              bán lẻ và dịch vụ tại Việt Nam.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {industries.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/#dang-ky"
                className="inline-flex cursor-pointer items-center rounded-xl bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4C88C6]/30"
              >
                Trải nghiệm ngay →
              </Link>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold text-black dark:text-white">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator className="dark:bg-neutral-800" />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            © {new Date().getFullYear()} Wokki. All rights reserved. — Được xây dựng bởi{" "}
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Wokki&apos;s Team
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-400 md:gap-6">
            <span>Như Phương · Thái Hòa · Minh Quang</span>
            <span className="hidden md:inline">·</span>
            <span>Phương Hòa · Thành Đạt · Phú Thịnh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
