"use client";

import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";

export function LandingFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white transition-colors duration-300 dark:bg-neutral-950">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}
