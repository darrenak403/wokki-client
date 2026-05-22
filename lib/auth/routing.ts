import { ROLE_ADMIN, type AppRole } from "@/lib/types/roles";

export function getPostLoginPath(role: AppRole): string {
  if (role === ROLE_ADMIN) return "/admin/dashboard";
  return "/dashboard";
}
