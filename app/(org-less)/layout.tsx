import { OrgLessShellGuard } from "@/components/shared/org-less-shell-guard";

export default function OrgLessLayout({ children }: { children: React.ReactNode }) {
  return <OrgLessShellGuard>{children}</OrgLessShellGuard>;
}
