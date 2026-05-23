import Link from "next/link";
import { CheckIcon } from "lucide-react";
import Register from "@/app/(landing)/components/Register";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "Miễn phí",
    period: "đến 15 nhân viên",
    description: "Cho quán nhỏ hoặc đội thử nghiệm — đủ lịch ca và chấm công cơ bản.",
    features: [
      "Lịch tuần & xuất bản",
      "Chấm công vào / ra",
      "Đổi ca giữa nhân viên",
      "1 chi nhánh",
    ],
    cta: "Bắt đầu",
    href: "/#dang-ky",
    highlighted: false,
  },
  {
    name: "Business",
    price: "299.000₫",
    period: "/ tháng",
    description: "Cho chuỗi vài chi nhánh — thêm báo cáo và quản lý đổi ca.",
    features: [
      "Mọi tính năng Starter",
      "Không giới hạn nhân viên",
      "Báo cáo công & tổng hợp lương",
      "Chat nhóm & tin nhắn riêng",
      "Đến 5 chi nhánh",
    ],
    cta: "Dùng thử 14 ngày",
    href: "/#dang-ky",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Liên hệ",
    period: "tùy quy mô",
    description: "Tổ chức lớn — SSO, SLA và triển khai theo yêu cầu.",
    features: [
      "Mọi tính năng Business",
      "Chi nhánh không giới hạn",
      "Export payroll CSV nâng cao",
      "Hỗ trợ ưu tiên & đồng hành triển khai",
      "Tùy chỉnh quy trình",
    ],
    cta: "Liên hệ kinh doanh",
    href: "/help",
    highlighted: false,
  },
] as const;

export function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 py-20 md:px-10 md:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 " />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 md:text-5xl dark:text-white">
              Plans & Pricing
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Chọn gói phù hợp với nhu cầu vận hành của bạn. Không phí ẩn, linh hoạt nâng cấp khi
              đội ngũ phát triển.
            </p>
          </div>

          <div className="mt-14 grid items-center gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative flex min-h-[430px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg shadow-neutral-900/5 transition-all duration-300 hover:-translate-y-1 dark:border-neutral-800 dark:bg-neutral-900",
                  plan.highlighted &&
                    "z-10 border-[#4C88C6] shadow-2xl shadow-[#102854]/20 ring-1 ring-[#4C88C6]/30 lg:scale-[1.07] dark:border-[#6AAED9]"
                )}
              >
                {plan.highlighted ? (
                  <div className="bg-linear-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] px-6 py-2 text-center text-[10px] font-extrabold uppercase tracking-widest text-white">
                    Most popular plan
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col p-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                      {plan.name}
                    </h2>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-7">
                    <span className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white md:text-5xl">
                      {plan.price}
                    </span>
                    <span className="ml-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-2 text-neutral-600 dark:text-neutral-400"
                      >
                        <CheckIcon
                          className="mt-0.5 size-4 shrink-0 text-[#4C88C6] dark:text-[#6AAED9]"
                          aria-hidden
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      plan.highlighted &&
                        "bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] hover:opacity-95",
                      !plan.highlighted &&
                        "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200",
                      "mt-9 w-full rounded-full"
                    )}
                  >
                    {plan.cta}
                  </Link>
                  {plan.highlighted ? (
                    <Link
                      href="/help"
                      className="mt-3 text-center text-xs text-neutral-500 hover:text-[#1D4D8F] dark:text-neutral-400 dark:hover:text-[#6AAED9]"
                    >
                      or contact sales
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Giá tham khảo cho thị trường Việt Nam. Gói Enterprise có hợp đồng riêng theo số người
            dùng và chi nhánh.
          </p>
        </div>
      </section>
      <Register />
    </>
  );
}
