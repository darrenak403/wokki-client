"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";
import ShieldCheck from "@/components/ui/shield-check";
import CreditCard from "@/components/ui/credit-card";
import RefreshIcon from "@/components/ui/refresh-icon";
import TelephoneIcon from "@/components/ui/telephone-icon";
import { formatPrice } from "./pricing-utils";

type BillingCycle = "monthly" | "yearly";

const plans = [
  {
    name: "Miễn Phí",
    description: "Dành cho cửa hàng nhỏ mới bắt đầu số hoá quản lý ca.",
    priceMonthly: 0,
    priceYearly: 0,
    badge: null,
    featured: false,
    cta: "Bắt đầu miễn phí",
    features: [
      { text: "Tối đa 5 nhân viên", included: true },
      { text: "AI xếp ca tự động", included: true },
      { text: "Chấm công GPS theo thời gian thực", included: true },
      { text: "Sàn đổi ca — duyệt một chạm", included: true },
      { text: "Cảnh báo thiếu nhân sự", included: true },
      { text: "Báo cáo giờ công & chi phí", included: true },
      { text: "Quản lý nhiều chi nhánh", included: true },
      { text: "Hỗ trợ ưu tiên 24/7", included: false },
      { text: "Tích hợp IoT nâng cao", included: false },
    ],
  },
  {
    name: "Pro",
    description: "Cho doanh nghiệp đang phát triển, cần tối ưu vận hành.",
    priceMonthly: 299000,
    priceYearly: 2990000,
    badge: "Phổ biến nhất",
    featured: true,
    cta: "Dùng thử 14 ngày",
    features: [
      { text: "Tối đa 50 nhân viên", included: true },
      { text: "AI xếp ca tự động", included: true },
      { text: "Chấm công GPS theo thời gian thực", included: true },
      { text: "Sàn đổi ca — duyệt một chạm", included: true },
      { text: "Cảnh báo thiếu nhân sự", included: true },
      { text: "Báo cáo giờ công & chi phí", included: true },
      { text: "Quản lý nhiều chi nhánh", included: true },
      { text: "Hỗ trợ ưu tiên 24/7", included: true },
      { text: "Tích hợp IoT nâng cao", included: false },
    ],
  },
  {
    name: "Doanh Nghiệp",
    description: "Giải pháp toàn diện cho chuỗi cửa hàng & tập đoàn.",
    priceMonthly: null,
    priceYearly: null,
    badge: null,
    featured: false,
    cta: "Liên hệ tư vấn",
    features: [
      { text: "Không giới hạn nhân viên", included: true },
      { text: "Tất cả tính năng Pro", included: true },
      { text: "Tích hợp IoT & thiết bị chấm công", included: true },
      { text: "API tuỳ chỉnh & webhook", included: true },
      { text: "Phân tích nâng cao & dashboard", included: true },
      { text: "Quản lý đa chi nhánh", included: true },
      { text: "Quản lý quyền nhân sự nâng cao", included: true },
      { text: "SLA cam kết & hỗ trợ 24/7", included: true },
    ],
  },
];


export default function Subscription() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const isMobile = useIsMobile();

  return (
    <section id="bang-gia" className={`w-full bg-white dark:bg-neutral-950 scroll-mt-16 transition-colors duration-300 ${isMobile ? "py-14" : "py-24"}`}>
      <div className={`mx-auto max-w-7xl ${isMobile ? "px-4" : "px-6"}`}>
        {/* Section header */}
        <div className={`${isMobile ? "mb-8" : "mb-14"} text-center`}>
          <span className="inline-block rounded-full border border-neutral-300 dark:border-neutral-700 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Bảng giá
          </span>
          <h2 className={`mt-4 font-bold text-neutral-900 dark:text-white ${isMobile ? "text-2xl" : "text-3xl md:text-4xl lg:text-5xl"}`}>
            Chọn gói phù hợp với{" "}
            <span className="bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-transparent">
              doanh nghiệp bạn
            </span>
          </h2>
          <p className={`mx-auto mt-4 max-w-xl text-neutral-500 ${isMobile ? "text-sm" : "text-base"}`}>
            Bắt đầu miễn phí, nâng cấp khi bạn cần. Không ràng buộc, huỷ bất cứ
            lúc nào.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                billing === "monthly"
                  ? "bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                billing === "yearly"
                  ? "bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              Hàng năm
              <span className="ml-1.5 inline-block rounded-full bg-[#ede5fd] px-2 py-0.5 text-xs font-bold text-[#1D4D8F]">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
          {plans.map((plan) => {
            const price =
              billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
            const isCustom = price === null;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${isMobile ? "p-6" : "p-8"} ${
                  plan.featured
                    ? "border-[#BCE8F5] bg-gradient-to-b from-[#EEF6FB]/60 to-white dark:from-[#0B1E3D]/40 dark:to-neutral-900 shadow-lg shadow-[#BCE8F5]/50 dark:shadow-[#0B1E3D]/20 ring-1 ring-[#BCE8F5] dark:ring-[#1D4D8F]"
                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-md"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] px-4 py-1.5 text-xs font-semibold text-white shadow-sm">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name & description */}
                <div className={plan.badge ? "mt-2" : ""}>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mt-6 mb-6">
                  {isCustom ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                        Liên hệ
                      </span>
                    </div>
                  ) : price === 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                        0đ
                      </span>
                      <span className="text-sm text-neutral-400 dark:text-neutral-500">/mãi mãi</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                        {formatPrice(price)}đ
                      </span>
                      <span className="text-sm text-neutral-400 dark:text-neutral-500">
                        /{billing === "monthly" ? "tháng" : "năm"}
                      </span>
                    </div>
                  )}
                  {billing === "yearly" && !isCustom && price !== 0 && (
                    <p className="mt-1 text-xs text-[#1D4D8F] dark:text-[#6AAED9] font-medium">
                      Tiết kiệm {formatPrice(plan.priceMonthly! * 12 - plan.priceYearly!)}đ
                      so với thanh toán hàng tháng
                    </p>
                  )}
                </div>

                {/* CTA */}
                <a
                  href="#dang-ky"
                  className={`cursor-pointer block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 ${
                    plan.featured
                      ? "bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] text-white shadow-md shadow-[#BCE8F5]/50 hover:shadow-lg hover:shadow-[#BCE8F5]/70"
                      : "border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  {plan.cta}
                </a>

                {/* Divider */}
                <div className="my-6 h-px bg-neutral-200 dark:bg-neutral-700" />

                {/* Features */}
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ede5fd]">
                          <Check className="h-3 w-3 text-[#1D4D8F]" />
                        </span>
                      ) : (
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                          <X className="h-3 w-3 text-neutral-400" />
                        </span>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-neutral-700 dark:text-neutral-300"
                            : "text-neutral-400 dark:text-neutral-500"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom trust bar */}
        <div className="mt-12 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-6">
          <div className={`grid gap-6 text-center ${isMobile ? "grid-cols-1" : "grid-cols-4"}`}>
            {[
              {
                icon: <ShieldCheck size={24} className="mx-auto text-[#4C88C6]" />,
                title: "Bảo mật SSL",
                desc: "Dữ liệu được mã hoá 256-bit",
              },
              {
                icon: <CreditCard size={24} className="mx-auto text-[#4C88C6]" />,
                title: "Không thẻ tín dụng",
                desc: "Dùng thử không cần thanh toán",
              },
              {
                icon: <RefreshIcon size={24} className="mx-auto text-[#4C88C6]" />,
                title: "Huỷ bất cứ lúc nào",
                desc: "Không ràng buộc hợp đồng",
              },
              {
                icon: <TelephoneIcon size={24} className="mx-auto text-[#4C88C6]" />,
                title: "Hỗ trợ nhanh chóng",
                desc: "Đội ngũ luôn sẵn sàng 24/7",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-2">
                {icon}
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
