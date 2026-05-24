"use client";
import { useRouter } from "next/navigation";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import SafeImage from "@/components/ui/SafeImage";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { useIsMobile } from "@/hooks/useMobile";

const badges = ["Nền tảng quản lí ca làm #1 Việt Nam"];

export default function HeroSection() {
  const isMobile = useIsMobile();
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full items-center overflow-hidden">
      {/* Background ripple */}
      <BackgroundRippleEffect />

      {/* Two-column layout */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        {/* LEFT — Content */}
        <div className="flex flex-col items-start">
          {/* Industry badges */}
          <div className="mb-6 flex flex-wrap gap-2">
            {badges.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-sm font-medium text-neutral-600 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-5xl lg:text-6xl dark:text-white">
            Tiết kiệm chi phí quản lí nhân sự đến{" "}
            <PointerHighlight containerClassName="inline-block">
            <span className="bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-transparent">
              40%.
            </span>
            </PointerHighlight>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-neutral-600 md:text-lg dark:text-neutral-400">
            Wokki giúp doanh nghiệp F&B, bán lẻ và dịch vụ tự động xếp ca,
            quản lý giờ công và điều phối nhân sự bán thời gian — nhanh hơn,
            chính xác hơn, không còn sai sót thủ công.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <InteractiveHoverButton
              variant="dark"
              className="text-base font-semibold"
              type="button"
              onClick={() => router.push("/register")}
            >
              Trải nghiệm ngay
            </InteractiveHoverButton>
            <a href="#van-de">
              <InteractiveHoverButton
                variant="light"
                className="text-base font-semibold"
              >
                Tìm hiểu thêm
              </InteractiveHoverButton>
            </a>
          </div>

          <p className="mt-8 text-sm text-neutral-400 dark:text-neutral-500">
            Được xây dựng cho{" "}
            <span className="font-semibold text-neutral-600 dark:text-neutral-300">
              323,000+
            </span>{" "}
            cửa hàng F&B tại Việt Nam
          </p>
        </div>

        {/* RIGHT — Macbook image */}
        {!isMobile && (
          <div className="flex items-center justify-center">
            <SafeImage
              src="/mac-noback.png"
              alt="Wokki dashboard trên macbook"
              width={960}
              height={640}
              className=" h-80 w-full object-cover"
              priority
            />
          </div>
        )}
      </div>
    </div>
  );
}
