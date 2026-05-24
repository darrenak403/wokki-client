import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import RocketIcon from "@/components/ui/rocket-icon";
import { cn } from "@/lib/utils";

export default function Register() {
  return (
    <section
      id="dang-ky"
      className="w-full scroll-mt-16 bg-white py-24 transition-colors duration-300 dark:bg-neutral-950"
    >
      <div className="mx-auto max-w-2xl px-6 text-center">
        <span className="inline-block rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          Bắt đầu miễn phí
        </span>
        <h2 className="mt-4 text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl lg:text-5xl">
          Sẵn sàng dùng thử{" "}
          <span className="bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-transparent">
            Wokki?
          </span>
        </h2>
        <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
          Tạo tài khoản và đăng nhập để quản lý ca làm, chấm công và đổi ca trên một nền tảng.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] font-semibold text-white hover:opacity-90",
            )}
          >
            <RocketIcon size={18} className="mr-2" />
            Đăng ký tài khoản
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Đã có tài khoản — Đăng nhập
          </Link>
        </div>

        <p className="mt-6 text-xs text-neutral-400">
          Miễn phí đăng ký · Dùng email công ty · Hỗ trợ F&B, bán lẻ và dịch vụ
        </p>
      </div>
    </section>
  );
}
