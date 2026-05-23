"use client";
import FeaturesGrid from "@/app/(landing)/components/FeaturesGrid";
import { useIsMobile } from "@/hooks/useMobile";

export default function Blog() {
  const isMobile = useIsMobile();

  return (
    <section id="blog" className="w-full bg-white dark:bg-neutral-950 scroll-mt-16 transition-colors duration-300">
      <div className={`relative z-20 mx-auto max-w-7xl ${isMobile ? "py-12 px-4" : "py-10 lg:py-40"}`}>
        <div className={`${isMobile ? "mb-8" : "mb-14"} text-center`}>
          <span className="inline-block rounded-full border border-neutral-300 dark:border-neutral-700 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Con số ấn tượng
          </span>
          <h4 className={`mt-4 font-bold text-neutral-900 dark:text-white dark:text-white ${isMobile ? "text-2xl" : "text-3xl md:text-4xl lg:text-5xl"}`}>
            Lợi ích{" "}
            <span className="bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-transparent font-bold">
              thực tế
            </span>{" "}
            khi dùng Wokki
          </h4>
          <p className={`mx-auto my-4 max-w-2xl text-center font-normal text-neutral-500 dark:text-neutral-300 ${isMobile ? "text-xs" : "text-sm lg:text-base"}`}>
            Dựa trên dữ liệu nghiên cứu thị trường và kết quả vận hành — đây là
            những con số mà Wokki mang lại cho doanh nghiệp của bạn.
          </p>
        </div>

        <FeaturesGrid />
      </div>
    </section>
  );
}

