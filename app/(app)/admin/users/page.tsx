import { UsersPanel } from "@/app/(app)/admin/users/components/users-panel";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tài khoản — Admin",
  path: "/admin/users",
  noindex: true,
});

export default function AdminUsersPage() {
  return <UsersPanel />;
}
