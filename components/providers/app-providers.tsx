"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/lib/providers";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Providers>
        <TooltipProvider>{children}</TooltipProvider>
      </Providers>
    </ThemeProvider>
  );
}
