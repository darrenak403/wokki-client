import { SiteFooter } from "@/components/shared/footer";
import { SiteHeader } from "@/components/shared/header";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
