import Image from "next/image";
import Link from "next/link";
import {
  CalendarDaysIcon,
  RefreshCwIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";

const industries = ["F&B", "Bán lẻ", "Dịch vụ", "Chuỗi cửa hàng"];

const highlights = [
  {
    icon: CalendarDaysIcon,
    title: "Xếp ca thông minh",
    description: "Lập lịch tuần, gợi ý phân ca và xuất bản lịch chính thức cho từng chi nhánh.",
  },
  {
    icon: UsersIcon,
    title: "Điều phối nhân sự",
    description: "Quản lý phòng ban, đăng ký ca ưu tiên và phân quyền Admin / Manager / Nhân viên.",
  },
  {
    icon: RefreshCwIcon,
    title: "Đổi ca & chấm công",
    description: "Sàn đổi ca, theo dõi giờ công và báo cáo — tất cả trên một nền tảng.",
  },
  {
    icon: SparklesIcon,
    title: "Hỗ trợ AI (tùy chọn)",
    description: "Giải thích lịch tuần khi cần; quyết định cuối cùng vẫn thuộc quản lý.",
  },
] as const;

export function AuthBrandPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "relative overflow-hidden border-b border-white/10 bg-brand-deep px-6 py-8 text-white"
          : "relative hidden overflow-hidden bg-brand-deep text-white lg:flex lg:flex-col"
      }
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand-blue/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-brand-medium/25 blur-3xl"
        aria-hidden
      />

      <div
        className={
          compact
            ? "relative z-10 mx-auto w-full max-w-lg"
            : "relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14"
        }
      >
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/WOKKI-LOGO.png"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 rounded-lg bg-white/95 object-contain p-1"
            />
            <span className="text-xl font-extrabold tracking-tight">Wokki</span>
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-brand-light/90">
            Nền tảng quản lý ca làm
          </p>
          <h1
            className={
              compact
                ? "mt-2 text-2xl font-bold leading-tight tracking-tight"
                : "mt-3 max-w-md text-3xl font-bold leading-tight tracking-tight xl:text-4xl"
            }
          >
            Vận hành ca làm{" "}
            <span className="bg-gradient-to-r from-brand-light via-white to-brand-medium bg-clip-text text-transparent">
              nhanh hơn, chính xác hơn
            </span>
          </h1>
          <p
            className={
              compact
                ? "mt-3 text-sm leading-relaxed text-white/75"
                : "mt-4 max-w-md text-base leading-relaxed text-white/75"
            }
          >
            Wokki giúp doanh nghiệp F&B, bán lẻ và dịch vụ tự động xếp ca, quản lý giờ công và
            điều phối nhân sự — giảm sai sót thủ công mỗi tuần.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {industries.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {!compact ? (
          <ul className="mt-12 space-y-5">
            {highlights.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-5 w-5 text-brand-light" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/65">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <p
          className={
            compact ? "mt-6 text-xs text-white/50" : "mt-10 text-sm text-white/50"
          }
        >
          © {new Date().getFullYear()} Wokki · GMT+7 · Dành cho đội vận hành tại Việt Nam
        </p>
      </div>
    </div>
  );
}
