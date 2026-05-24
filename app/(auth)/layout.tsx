import { AuthBrandPanel } from "@/app/(auth)/components/AuthBrandPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <div className="lg:hidden">
        <AuthBrandPanel compact />
      </div>
      <AuthBrandPanel />
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
        {children}
      </div>
    </div>
  );
}
