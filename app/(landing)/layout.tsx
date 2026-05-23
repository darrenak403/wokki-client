import { LandingFrame } from "@/app/(landing)/components/LandingFrame";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <LandingFrame>{children}</LandingFrame>;
}
