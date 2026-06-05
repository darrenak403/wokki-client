'use client';

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface FancyTextProps {
  children: string;
  className?: string;
  fillClassName?: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  onComplete?: () => void;
}

const FancyText = React.forwardRef<HTMLSpanElement, FancyTextProps>(
  (
    {
      children,
      className = 'text-5xl font-black leading-none text-black/10 dark:text-white/10',
      fillClassName = 'text-black dark:text-white',
      stagger = 0.08,
      duration = 1.4,
      delay = 0,
      onComplete,
    },
    ref,
  ) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    const finalRef = (ref ?? spanRef) as React.RefObject<HTMLSpanElement>;

    const chars = children.split('');

    return (
      <span ref={finalRef} className='relative inline-block'>
        <span
          className={cn(className, 'invisible')}
          aria-hidden="true"
        >
          {children}
        </span>

        <span className='absolute inset-0 flex'>
          {chars.map((char, i) => (
            <motion.span
              key={i}
              className={cn(className, fillClassName)}
              initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{
                duration,
                delay: delay + i * stagger,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onAnimationComplete={() => {
                if (i === chars.length - 1) {
                  onComplete?.();
                }
              }}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : 'normal',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </span>
      </span>
    );
  },
);

FancyText.displayName = 'FancyText';
export { FancyText };
