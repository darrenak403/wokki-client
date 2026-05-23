"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size={compact ? "icon-sm" : "sm"}
        disabled
        className={compact ? undefined : "min-w-[108px]"}
      />
    );
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <Button
      variant="outline"
      size={compact ? "icon-sm" : "sm"}
      className={compact ? undefined : "min-w-[108px] gap-2"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      {compact ? (
        <span className="sr-only">{isDark ? "Light" : "Dark"}</span>
      ) : (
        isDark ? "Light" : "Dark"
      )}
    </Button>
  );
}
