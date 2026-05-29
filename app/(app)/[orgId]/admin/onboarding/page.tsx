import { OnboardingPanel } from "@/app/(app)/[orgId]/admin/onboarding/components/OnboardingPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Thiết lập tổ chức — Admin",
  path: "/admin/onboarding",
  noindex: true,
});

export default function AdminOnboardingPage() {
  return <OnboardingPanel />;
}
