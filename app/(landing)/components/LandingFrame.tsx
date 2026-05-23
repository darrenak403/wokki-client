"use client";

import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { RegisterDialogProvider } from "@/features/waitlist/hooks/useRegisterDialog";
import RegisterDialog from "@/app/(landing)/components/RegisterDialog";

export function LandingFrame({ children }: { children: React.ReactNode }) {
  return (
    <RegisterDialogProvider>
      <main className="min-h-screen bg-white transition-colors duration-300 dark:bg-neutral-950">
        <SiteHeader />
        {children}
        <SiteFooter />
        <RegisterDialog />
      </main>
    </RegisterDialogProvider>
  );
}
