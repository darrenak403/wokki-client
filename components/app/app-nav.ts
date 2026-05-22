import type { AppRole } from "@/lib/types/roles";
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";

export type AppNavItem = {
  href: string;
  label: string;
  /** Wave / module — ghi chú cho agent, không hiển thị UI */
  module?: string;
};

const ADMIN_NAV: AppNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", module: "core" },
  // Wave 2+
  { href: "/admin/users", label: "Người dùng", module: "wave2" },
  { href: "/admin/branches", label: "Chi nhánh", module: "wave2" },
];

const MANAGER_NAV: AppNavItem[] = [
  { href: "/manager/dashboard", label: "Dashboard", module: "core" },
  { href: "/manager/schedule", label: "Lịch ca", module: "wave3" },
  { href: "/manager/attendance", label: "Chấm công", module: "wave5" },
];

const USER_NAV: AppNavItem[] = [
  { href: "/user/dashboard", label: "Dashboard", module: "core" },
  { href: "/user/schedule", label: "Lịch của tôi", module: "wave4" },
  { href: "/user/swap", label: "Đổi ca", module: "wave4" },
];

export function getAppNavForRole(role: AppRole): AppNavItem[] {
  switch (role) {
    case ROLE_ADMIN:
      return ADMIN_NAV;
    case ROLE_MANAGER:
      return MANAGER_NAV;
    case ROLE_USER:
      return USER_NAV;
    default:
      return USER_NAV;
  }
}
