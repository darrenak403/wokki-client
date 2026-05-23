"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Compare } from "@/components/ui/compare";
import { useIsMobile } from "@/hooks/useMobile";

const oldItems = [
  "Xếp ca thủ công bằng Excel, giấy tờ rời rạc",
  "Thông báo qua Zalo, Messenger — dễ bị bỏ lỡ",
  "Trùng ca, thiếu người vào giờ cao điểm",
  "Không kiểm soát được giờ công thực tế",
  "Mất hàng giờ mỗi tuần chỉ để lập lịch",
];

const newItems = [
  "AI tự động xếp ca tối ưu trong vài giây",
  "Thông báo lịch làm ngay trên điện thoại",
  "Cảnh báo thông minh khi thiếu nhân sự",
  "Chấm công GPS & IoT theo thời gian thực",
  "Sàn đổi ca minh bạch, duyệt một chạm",
];

const SWEEP_DURATION = 5000; // 0→100% in 5s
const HOLD_DURATION = 1000;  // pause at 100% only
const FULL_CYCLE = SWEEP_DURATION * 2 + HOLD_DURATION; // forward + hold + backward (no hold at 0%)
const ITEM_COUNT = oldItems.length;

// Each item reveals between 50%–100%, evenly spaced
function getItemThreshold(index: number) {
  return 50 + (index * 50) / ITEM_COUNT;
}

function calcProgress(elapsed: number): number {
  const t = elapsed % FULL_CYCLE;
  if (t < SWEEP_DURATION) {
    // Phase 1: 0→100%
    return (t / SWEEP_DURATION) * 100;
  } else if (t < SWEEP_DURATION + HOLD_DURATION) {
    // Phase 2: hold at 100%
    return 100;
  } else {
    // Phase 3: 100→0%
    return (1 - (t - SWEEP_DURATION - HOLD_DURATION) / SWEEP_DURATION) * 100;
  }
}

export default function Problem() {
  const [progress, setProgress] = useState(0); // 0–100
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const autoResumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // IntersectionObserver: start animation when section is in viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Smooth animation loop using requestAnimationFrame
  useEffect(() => {
    if (!isVisible || isDragging) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    lastTimestampRef.current = null;

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const delta = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;
      elapsedRef.current += delta;

      const newProgress = calcProgress(elapsedRef.current);
      setProgress(newProgress);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isVisible, isDragging]);

  // Sync elapsed time when user drags so auto-animation resumes from correct position
  const syncElapsedToProgress = useCallback((p: number) => {
    // Map progress back to elapsed time (phase 1: 0→100%)
    elapsedRef.current = (p / 100) * SWEEP_DURATION;
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    // Resume auto-animation after 2s of inactivity
    autoResumeTimerRef.current = setTimeout(() => {
      syncElapsedToProgress(progress);
      setIsDragging(false);
    }, 2000);
  }, [progress, syncElapsedToProgress]);

  const handlePercentageChange = useCallback((percent: number) => {
    setProgress(percent);
  }, []);

  const isGoodSide = progress > 50;

  return (
    <section
      ref={sectionRef}
      id="van-de"
      className={`w-full bg-white dark:bg-neutral-950 scroll-mt-16 transition-colors duration-300 ${isMobile ? "py-14" : "py-24"}`}
    >
      <div className={`mx-auto max-w-7xl ${isMobile ? "px-4" : "px-6"}`}>
        {/* Section header */}
        <div className={`${isMobile ? "mb-8" : "mb-14"} text-center`}>
          <span className="inline-block rounded-full border border-neutral-300 dark:border-neutral-700 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Vấn đề gặp phải
          </span>
          <h2 className={`mt-4 font-bold text-neutral-900 dark:text-white ${isMobile ? "text-2xl" : "text-3xl md:text-4xl lg:text-5xl"}`}>
            Trước và sau khi dùng{" "}
              <span className="bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-transparent">
                Wokki
              </span>
          </h2>
          <p className={`mx-auto mt-4 max-w-xl text-neutral-500 dark:text-neutral-400 ${isMobile ? "text-sm" : "text-base"}`}>
            {isMobile
              ? "Xem sự khác biệt khi dùng Wokki."
              : "Xem thanh tiến trình để thấy sự khác biệt. Nội dung sẽ thay đổi theo từng giai đoạn."}
          </p>
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          {/* LEFT — Comparison list */}
          <div className="flex flex-col">
            {/* Badge row */}
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-red-400">
                  Cách cũ
                </span>
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-full bg-[#EEF6FB] px-4 py-1.5 transition-all duration-500 ${
                  isGoodSide ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-[#4C88C6]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[#4C88C6]">
                  Với Wokki
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white transition-all duration-500 md:text-3xl">
              {isGoodSide
                ? "Xếp ca thông minh, vận hành trơn tru"
                : "Quản lý ca thủ công đang kìm hãm bạn"}
            </h3>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 transition-all duration-500">
              {isGoodSide
                ? "Wokki tự động hóa toàn bộ quy trình xếp ca, chấm công và điều phối nhân sự — giúp bạn tập trung vào việc phát triển kinh doanh."
                : "Hơn 85% doanh nghiệp F&B và bán lẻ gặp hậu quả tiêu cực từ việc phân ca bằng Excel, giấy tờ và nhắn tin rời rạc."}
            </p>

            {/* Comparison list */}
            <ul className="mt-8 space-y-4">
              {oldItems.map((oldItem, i) => {
                const threshold = getItemThreshold(i);
                const showNew = progress >= threshold;

                return (
                  <li key={i} className="flex items-start gap-4">
                    {/* Old item — always visible */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <svg
                          className="h-3 w-3 text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                      <span className={`text-sm transition-all duration-300 ${showNew ? "text-neutral-400 line-through" : "text-neutral-600 dark:text-neutral-300"}`}>
                        {oldItem}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div
                      className={`flex items-center shrink-0 transition-all duration-500 ${
                        showNew ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <svg className="h-4 w-4 text-[#4C88C6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>

                    {/* New item — appears inline */}
                    <div
                      className={`flex items-start gap-3 flex-1 min-w-0 transition-all duration-500 ${
                        showNew
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-3"
                      }`}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ede5fd]">
                        <svg
                          className="h-3 w-3 text-[#4C88C6]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium text-[#1D4D8F] dark:text-[#4C88C6]">
                        {newItems[i]}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Progress bar */}
            <div className="mt-8 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className={!isGoodSide ? "font-semibold text-red-400" : ""}>Cách cũ</span>
                <span className={isGoodSide ? "font-semibold text-[#4C88C6]" : ""}>Với Wokki</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-colors duration-300"
                  style={{
                    width: `${progress}%`,
                    background: progress <= 50
                      ? `linear-gradient(to right, #ef4444, #f87171)`
                      : `linear-gradient(to right, #ef4444, #10b981)`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — Compare slider */}
          <div className="flex justify-center">
            <Compare
              firstImage="/good-way.png"
              secondImage="/old-way-no-back.png"
              className="h-[420px] w-full max-w-lg rounded-2xl"
              slideMode="drag"
              showHandlebar
              autoplay={false}
              controlledPercentage={isDragging ? undefined : progress}
              initialSliderPercentage={0}
              onPercentageChange={handlePercentageChange}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>

        {/* Bottom stat bar */}
        <div className={`${isMobile ? "mt-8" : "mt-12"} grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-1 gap-4 sm:grid-cols-3"} rounded-2xl bg-neutral-100 dark:bg-neutral-900 ${isMobile ? "p-4" : "p-6"}`}>
          {[
            { stat: "85%", label: "doanh nghiệp gặp sai sót phân ca thủ công" },
            { stat: "323K+", label: "cửa hàng F&B tại Việt Nam cần giải pháp" },
            { stat: "60%", label: "việc làm do SMEs tạo ra — cần quản lý tốt hơn" },
          ].map(({ stat, label }) => (
            <div key={stat} className="text-center">
              <p className={`font-extrabold text-neutral-900 dark:text-white ${isMobile ? "text-2xl" : "text-3xl"}`}>{stat}</p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
