import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "dark" | "light"
}

export function InteractiveHoverButton({
  children,
  className,
  variant = "dark",
  ...props
}: InteractiveHoverButtonProps) {
  const isDark = variant === "dark"

  return (
    <button
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold",
        isDark
          ? "bg-black text-white border-neutral-700 dark:bg-white dark:text-black dark:border-neutral-300"
          : "bg-white text-black border-neutral-300 dark:bg-black dark:text-white dark:border-neutral-700",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]",
            isDark
              ? "bg-white dark:bg-black"
              : "bg-black dark:bg-white"
          )}
        />
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div
        className={cn(
          "absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100",
          isDark
            ? "text-black dark:text-white"
            : "text-white dark:text-black"
        )}
      >
        <span>{children}</span>
        <ArrowRight />
      </div>
    </button>
  )
}
