"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIsMobile } from "@/hooks/useMobile";
import { useTheme } from "next-themes";

const faqs = [
  {
    question: "Wokki là gì?",
    answer:
      "Wokki là nền tảng quản lý ca làm việc thông minh dành cho ngành F&B, bán lẻ và dịch vụ. Wokki giúp doanh nghiệp tự động xếp ca bằng AI, chấm công GPS theo thời gian thực, quản lý đổi ca và theo dõi giờ công — tất cả trên một nền tảng duy nhất.",
  },
  {
    question: "Wokki phù hợp với ai?",
    answer:
      "Wokki được thiết kế cho chủ cửa hàng, quản lý chi nhánh và bộ phận nhân sự tại các doanh nghiệp F&B, chuỗi bán lẻ, dịch vụ có sử dụng nhân viên part-time hoặc theo ca. Từ 1 cửa hàng nhỏ đến chuỗi hàng trăm chi nhánh đều có thể sử dụng.",
  },
  {
    question: "Wokki hoạt động như thế nào?",
    answer:
      "Bạn chỉ cần đăng ký, thêm nhân viên và thiết lập khung ca. AI của Wokki sẽ tự động phân ca tối ưu dựa trên nhu cầu nhân sự, lịch trống của nhân viên và các ràng buộc bạn đặt ra. Nhân viên nhận thông báo lịch làm trên điện thoại, check-in/check-out qua GPS, và có thể đổi ca linh hoạt.",
  },
  {
    question: "Wokki có miễn phí không?",
    answer:
      "Có! Wokki cung cấp gói Miễn Phí cho cửa hàng nhỏ (tối đa 5 nhân viên) với các tính năng cơ bản. Khi doanh nghiệp phát triển, bạn có thể nâng cấp lên gói Pro hoặc Doanh Nghiệp để sử dụng AI xếp ca, chấm công GPS, báo cáo nâng cao và nhiều tính năng khác.",
  },
  {
    question: "Dữ liệu của tôi có được bảo mật không?",
    answer:
      "Tuyệt đối. Wokki sử dụng mã hoá SSL 256-bit, lưu trữ dữ liệu trên hạ tầng cloud bảo mật cao và tuân thủ các tiêu chuẩn bảo vệ dữ liệu. Chỉ người được uỷ quyền mới có thể truy cập thông tin nhân sự của doanh nghiệp bạn.",
  },
  {
    question: "Tôi có thể liên hệ hỗ trợ bằng cách nào?",
    answer:
      "Gói Miễn Phí được hỗ trợ qua email. Gói Pro có hỗ trợ ưu tiên 24/7 qua chat và hotline. Gói Doanh Nghiệp được gán Account Manager riêng để đồng hành cùng bạn từ triển khai đến vận hành.",
  },
];

export default function AboutQuestion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="cau-hoi" className={`w-full bg-white dark:bg-neutral-950 scroll-mt-16 transition-colors duration-300 ${isMobile ? "py-14" : "py-24"}`}>
      <div className={`mx-auto max-w-3xl ${isMobile ? "px-4" : "px-6"}`}>
        {/* Section header */}
        <div className={`${isMobile ? "mb-8" : "mb-14"} text-center`}>
          <span className="inline-block rounded-full border border-neutral-300 dark:border-neutral-700 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            FAQ
          </span>
          <h2 className={`mt-4 font-bold text-neutral-900 dark:text-white ${isMobile ? "text-2xl" : "text-3xl md:text-4xl lg:text-5xl"}`}>
            Câu hỏi{" "}
            <span className="bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-transparent">
              thường gặp
            </span>
          </h2>
          <p className={`mx-auto mt-4 max-w-xl text-neutral-500 dark:text-neutral-400 ${isMobile ? "text-sm" : "text-base"}`}>
            Những thắc mắc phổ biến nhất về Wokki — nếu bạn cần thêm thông tin,
            đừng ngại liên hệ chúng tôi.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  backgroundColor: isOpen
                    ? (isDark ? "rgb(26 10 61)" : "rgb(245 240 255)")
                    : (isDark ? "rgb(23 23 23)" : "rgb(250 250 250)"),
                }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
              >
                {/* Question */}
                <button
                  onClick={() => toggle(index)}
                  className={`cursor-pointer flex w-full items-center justify-between gap-4 text-left ${isMobile ? "px-4 py-4" : "px-6 py-5"}`}
                >
                  <span className={`font-semibold text-neutral-900 dark:text-white ${isMobile ? "text-sm" : "text-base md:text-lg"}`}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 0 : 0 }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F]"
                  >
                    <motion.svg
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      {isOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 5v14M5 12h14"
                        />
                      )}
                    </motion.svg>
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className={`${isMobile ? "px-4 pb-4" : "px-6 pb-5"}`}>
                        <div className="h-px w-full bg-neutral-200 dark:bg-neutral-700 mb-4" />
                        <motion.p
                          initial={{ y: -8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -8, opacity: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                          className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
