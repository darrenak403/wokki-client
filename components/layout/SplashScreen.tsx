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
  const [textRevealed, setTextRevealed] = useState(false);
  const isMobile = useIsMobile();

  const handleTextComplete = useCallback(() => {
    setTextRevealed(true);
    setTimeout(() => setIsExiting(true), 1650);
  }, []);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {!isExiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.94,
            filter: "blur(14px)",
            transition: { duration: 0.75, ease: [0.4, 0, 0.2, 1] },
          }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white dark:bg-neutral-950"
        >
          {/* Subtle top gradient */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(143,88,228,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(143,88,228,0.1)_0%,transparent_70%)]" />

          {/* Main text — effect 3: exit flies up independently */}
          <motion.div
            className="relative flex flex-col items-center gap-2 px-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -52,
              filter: "blur(8px)",
              transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
            }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Text wrapper: effect 1 (scale spring) + effect 2 (shimmer) */}
            <motion.div
              className="relative inline-block"
              animate={textRevealed ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
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

              {/* Shimmer sweep — effect 2 */}
              {textRevealed && (
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  initial={{ x: "-110%" }}
                  animate={{ x: "210%" }}
                  transition={{ duration: 1.5, delay: 0.08, ease: "easeInOut" }}
                  style={{
                    width: "45%",
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)",
                    mixBlendMode: "screen",
                  }}
                />
              )}
            </motion.div>

            {/* Subtitle */}
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
