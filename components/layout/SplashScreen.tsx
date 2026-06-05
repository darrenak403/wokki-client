"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FancyText } from "@/components/ui/fancy-text";
import { useIsMobile } from "@/hooks/useMobile";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const isMobile = useIsMobile();

  const handleTextComplete = useCallback(() => {
    // Small pause after text animation, then start exit
    setTimeout(() => setIsExiting(true), 600);
  }, []);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {!isExiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.94, y: -12, filter: "blur(12px)" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white dark:bg-neutral-950"
        >
          {/* Subtle top gradient */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(143,88,228,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(143,88,228,0.1)_0%,transparent_70%)]" />

          {/* Main text */}
          <motion.div
            className="relative flex flex-col items-center gap-2 px-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <FancyText
              className={`${
                isMobile ? "text-4xl" : "text-6xl md:text-8xl lg:text-9xl"
              } font-black leading-none tracking-tighter text-neutral-200 dark:text-neutral-800`}
              fillClassName="bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-black dark:text-white"
              stagger={isMobile ? 0.07 : 0.1}
              duration={isMobile ? 0.9 : 1.2}
              delay={0.3}
              onComplete={handleTextComplete}
            >
              WOKKI TEAM
            </FancyText>

            {/* Subtitle line that appears after a delay */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: isMobile ? 1.2 : 1.6 }}
              className={isMobile ? "mt-2" : "mt-3"}
            >
              <span
                className={`${
                  isMobile ? "text-xs" : "text-sm md:text-base"
                } font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500`}
              >
                Nền tảng quản lí ca làm #1 Việt Nam
              </span>
            </motion.div>
          </motion.div>

          {/* Bottom loading bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: isMobile ? 1.6 : 2.2,
              delay: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className={`absolute bottom-0 left-0 ${isMobile ? "h-1.5" : "h-1"} w-full origin-left bg-linear-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F]`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
