"use client";

import { motion, PanInfo } from "motion/react";
import React, { useState, useMemo } from "react";
import { useTheme } from "next-themes";

interface ChainThemeToggleProps {
  className?: string;
}

export function ChainThemeToggle({ className = "" }: ChainThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const chainLength = useMemo(() => (isDarkMode ? 36 : 20), [isDarkMode]);
  const chainPulled = useMemo(() => isDarkMode, [isDarkMode]);

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    const finalDragY = Math.min(20, Math.max(0, info.offset.y));
    if (finalDragY > 8) {
      const newTheme = theme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    }
    setTimeout(() => {
      setDragY(0);
    }, 100);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Chain */}
      <motion.div
        className="w-0.5 bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-300 rounded-full shadow-sm relative"
        animate={{
          height: chainLength + dragY,
        }}
        transition={{
          duration: isDragging ? 0.05 : 0.6,
          ease: isDragging ? "linear" : "easeOut",
          type: isDragging ? "tween" : "spring",
          stiffness: isDragging ? undefined : 200,
          damping: isDragging ? undefined : 20,
        }}
        style={{
          height: `${chainLength + dragY}px`,
          transformOrigin: "top center",
        }}
      >
        {dragY > 4 && (
          <div className="absolute inset-0 flex flex-col justify-evenly">
            {Array.from({
              length: Math.floor((chainLength + dragY) / 8),
            }).map((_, i) => (
              <div
                key={i}
                className="w-full h-px bg-gray-500 dark:bg-gray-400 rounded-full opacity-40"
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Pull Handle */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 16 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={(
          _event: MouseEvent | TouchEvent | PointerEvent,
          info: PanInfo
        ) => {
          const newDragY = Math.min(20, Math.max(0, info.offset.y));
          setDragY(newDragY);
        }}
        whileHover={{ scale: 1.1 }}
        whileDrag={{
          scale: 1.15,
          boxShadow: `0 ${4 + dragY * 0.3}px ${10 + dragY * 0.3}px rgba(0,0,0,0.25)`,
        }}
        className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-300 dark:to-yellow-500 rounded-full shadow-md border-2 border-yellow-500 dark:border-yellow-400 transition-shadow duration-200 relative overflow-hidden cursor-grab active:cursor-grabbing"
        animate={{
          rotateZ: chainPulled ? 180 : 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        style={{ position: "relative", top: -14, y: 0 }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-transparent opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col space-y-px">
            <motion.div
              className="w-2 h-px bg-yellow-700 dark:bg-yellow-200 rounded-full opacity-60"
              animate={{ scaleX: 1 + dragY * 0.02 }}
            />
            <motion.div
              className="w-2 h-px bg-yellow-700 dark:bg-yellow-200 rounded-full opacity-60"
              animate={{ scaleX: 1 + dragY * 0.02 }}
            />
          </div>
        </div>

        {/* Sun/Moon icon overlay */}
        {isDarkMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-yellow-500/90 dark:bg-yellow-400/90 rounded-full backdrop-blur-sm"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-800"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </motion.div>
        )}

        {/* Tooltip */}
        {!isDragging && !chainPulled && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-[9px] text-gray-500 dark:text-gray-400 whitespace-nowrap pointer-events-none bg-white/90 dark:bg-neutral-800/90 px-1.5 py-0.5 rounded-full shadow-sm"
            initial={{ opacity: 0, y: -3 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [0, -2, -2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          >
            Kéo để đổi theme!
          </motion.div>
        )}

        {/* Drag feedback */}
        {isDragging && dragY > 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: dragY > 8 ? 1 : 0.7,
              scale: dragY > 8 ? 1.05 : 1,
            }}
            className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 text-[9px] text-white px-2 py-1 rounded-full whitespace-nowrap pointer-events-none font-medium bg-neutral-800 dark:bg-neutral-600"
          >
            {dragY > 8
              ? `🌟 ${isDarkMode ? "Light" : "Dark"}!`
              : `Kéo thêm...`}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
