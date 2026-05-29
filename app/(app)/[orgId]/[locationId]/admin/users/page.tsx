import { UsersPanel } from "@/app/(app)/[orgId]/[locationId]/admin/users/components/UsersPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Tài khoản — Admin",
  path: "/admin/users",
  noindex: true,
});

export default function AdminUsersPage() {
  return <UsersPanel />;
}
