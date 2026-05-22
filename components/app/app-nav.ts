import type { AppRole } from "@/lib/types/roles";
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";

export type AppNavItem = {
  href: string;
  label: string;
  /** Wave / module — ghi chú cho agent, không hiển thị UI */
  module?: string;
  /** Hiển thị badge pending swap (Wave 5) */
  showSwapPendingBadge?: boolean;
};

const ADMIN_NAV: AppNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", module: "core" },
  { href: "/admin/locations", label: "Chi nhánh", module: "wave2" },
  { href: "/admin/departments", label: "Phòng ban", module: "wave2" },
  { href: "/admin/shifts", label: "Ca làm việc", module: "wave2" },
  { href: "/admin/employees", label: "Nhân sự", module: "wave2" },
  { href: "/admin/users", label: "Tài khoản", module: "wave2" },
  { href: "/admin/schedule", label: "Lịch ca", module: "wave3" },
  { href: "/admin/swap", label: "Đổi ca", module: "wave5", showSwapPendingBadge: true },
  { href: "/admin/attendance", label: "Chấm công", module: "wave5" },
  { href: "/admin/payroll", label: "Lương", module: "wave5" },
];

const MANAGER_NAV: AppNavItem[] = [
  { href: "/manager/dashboard", label: "Dashboard", module: "core" },
  { href: "/manager/locations", label: "Chi nhánh", module: "wave2" },
  { href: "/manager/departments", label: "Phòng ban", module: "wave2" },
  { href: "/manager/shifts", label: "Ca làm việc", module: "wave2" },
  { href: "/manager/employees", label: "Nhân sự", module: "wave2" },
  { href: "/manager/schedule", label: "Lịch ca", module: "wave3" },
  { href: "/manager/swap", label: "Đổi ca", module: "wave5", showSwapPendingBadge: true },
  { href: "/manager/attendance", label: "Chấm công", module: "wave5" },
  { href: "/manager/payroll", label: "Lương", module: "wave5" },
];

const USER_NAV: AppNavItem[] = [
  { href: "/user/dashboard", label: "Dashboard", module: "core" },
  { href: "/user/schedule", label: "Lịch của tôi", module: "wave4" },
  { href: "/user/swap", label: "Đổi ca", module: "wave4" },
  { href: "/user/attendance", label: "Chấm công", module: "wave4" },
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
