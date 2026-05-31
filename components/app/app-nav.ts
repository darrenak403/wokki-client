import type { AppRole } from "@/lib/types/roles";
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";
import { APP_AREA_PREFIX } from "@/lib/support/auth/app-routes";
import {
  buildBranchScopedPath,
  buildOrgScopedPath,
} from "@/lib/support/routing/tenant-routes";

export type AppNavItem = {
  href: string;
  /** Stable React key — legacy path feature suffix (e.g. `dashboard`, `chat`). */
  navKey: string;
  label: string;
  description?: string;
  /** Wave / module — ghi chú cho agent, không hiển thị UI */
  module?: string;
  /** Hiển thị badge pending swap (Wave 5) */
  showSwapPendingBadge?: boolean;
};

type AppNavItemDef = Omit<AppNavItem, "navKey">;

const ADMIN_NAV: AppNavItemDef[] = [
  {
    href: "/admin/dashboard",
    label: "Tổng quan",
    description: "Thống kê tổ chức — chi nhánh, phòng ban, nhân viên.",
    module: "core",
  },
  {
    href: "/admin/workspace",
    label: "Tổ chức",
    description: "Sơ đồ chi nhánh, phòng ban và Manager phụ trách.",
    module: "workspace",
  },
  {
    href: "/admin/shifts",
    label: "Ca làm việc",
    description: "Định nghĩa ca sáng, chiều, tối trước khi xếp lịch tuần.",
    module: "wave2",
  },
  {
    href: "/admin/employees",
    label: "Nhân sự",
    description: "Tạo nhân viên kèm tài khoản đăng nhập, phòng ban và vai trò.",
    module: "wave2",
  },
  {
    href: "/admin/schedule",
    label: "Lịch ca",
    description: "Phân ca theo phòng ban và tuần, sau đó công bố cho nhân viên.",
    module: "wave3",
  },
  {
    href: "/admin/swap",
    label: "Đổi ca",
    description: "Nhật ký các ca đã đổi trên lịch Draft.",
    module: "wave5",
  },
  {
    href: "/admin/attendance",
    label: "Chấm công",
    description: "Xem và điều chỉnh chấm công nhân viên.",
    module: "wave5",
  },
  {
    href: "/admin/payroll",
    label: "Lương",
    description: "Tổng lương theo phòng ban và kỳ, hỗ trợ xuất CSV.",
    module: "wave5",
  },
  {
    href: "/admin/overtime",
    label: "Tăng ca",
    description: "Duyệt yêu cầu tăng ca.",
    module: "overtime",
  },
  {
    href: "/admin/chat",
    label: "Tin nhắn",
    description: "Chat nội bộ, tạo kênh, gửi tin và duyệt tin.",
    module: "wave6",
  },
];

const MANAGER_NAV: AppNavItemDef[] = [
  {
    href: "/manager/dashboard",
    label: "Tổng quan",
    description: "Thống kê chi nhánh trong phạm vi quản lý.",
    module: "core",
  },
  {
    href: "/manager/workspace",
    label: "Tổ chức",
    description: "Sơ đồ chi nhánh trong phạm vi quản lý.",
    module: "workspace",
  },
  {
    href: "/manager/shifts",
    label: "Ca làm việc",
    description: "Định nghĩa và quản lý ca làm trước khi xếp lịch tuần.",
    module: "wave2",
  },
  {
    href: "/manager/employees",
    label: "Nhân sự",
    description: "Danh sách nhân viên trong phạm vi quản lý.",
    module: "wave2",
  },
  {
    href: "/manager/schedule",
    label: "Lịch ca",
    description: "Phân ca theo phòng ban và tuần, sau đó công bố cho nhân viên.",
    module: "wave3",
  },
  {
    href: "/manager/swap",
    label: "Đổi ca",
    description: "Nhật ký các ca đã đổi trên lịch Draft.",
    module: "wave5",
  },
  {
    href: "/manager/attendance",
    label: "Chấm công",
    description: "Xem và điều chỉnh chấm công nhân viên.",
    module: "wave5",
  },
  {
    href: "/manager/payroll",
    label: "Lương",
    description: "Tổng lương theo phòng ban và kỳ.",
    module: "wave5",
  },
  {
    href: "/manager/overtime",
    label: "Tăng ca",
    description: "Duyệt yêu cầu tăng ca.",
    module: "overtime",
  },
  {
    href: "/manager/chat",
    label: "Tin nhắn",
    description: "Chat nội bộ, tạo kênh và nhắn với team.",
    module: "wave6",
  },
];

const USER_NAV: AppNavItemDef[] = [
  {
    href: "/user/dashboard",
    label: "Dashboard",
    description: "Khu làm việc dành cho nhân viên trong Wokki.",
    module: "core",
  },
  {
    href: "/user/schedule",
    label: "Lịch của tôi",
    description: "Ca đã công bố trong 28 ngày tới, chỉ xem và không chỉnh sửa.",
    module: "wave4",
  },
  {
    href: "/user/swap",
    label: "Đổi ca",
    description: "Bảng tin nhường ca và đổi chéo khi lịch còn Draft.",
    module: "wave4",
  },
  {
    href: "/user/attendance",
    label: "Chấm công",
    description: "Chấm vào hoặc ra — theo ca hoặc linh hoạt (tùy phòng ban).",
    module: "wave4",
  },
  {
    href: "/user/payroll",
    label: "Lương",
    description: "Tổng giờ và lương tháng hiện tại.",
    module: "wave4",
  },
  {
    href: "/user/chat",
    label: "Tin nhắn",
    description: "Chat với đồng nghiệp và quản lý.",
    module: "wave6",
  },
];

export function getAppNavForRole(role: AppRole): AppNavItem[] {
  let items: AppNavItemDef[];
  switch (role) {
    case ROLE_ADMIN:
      items = ADMIN_NAV;
      break;
    case ROLE_MANAGER:
      items = MANAGER_NAV;
      break;
    case ROLE_USER:
    default:
      items = USER_NAV;
      break;
  }

  return items.map((item) => ({
    ...item,
    navKey: featureSuffix(item.href, role),
  }));
}

function featureSuffix(legacyHref: string, role: AppRole): string {
  const prefix = APP_AREA_PREFIX[role];
  if (legacyHref === prefix) return "dashboard";
  if (legacyHref.startsWith(`${prefix}/`)) {
    return legacyHref.slice(prefix.length + 1);
  }
  return "dashboard";
}

const ORG_ONLY_SUFFIX: Partial<Record<AppRole, Set<string>>> = {
  [ROLE_ADMIN]: new Set(["onboarding"]),
};

/** Nav links with /{orgId}/{locationId}/… or /{orgId}/… for org-only routes. */
export function buildTenantNav(
  role: AppRole,
  orgId: string,
  locationId: string | null
): AppNavItem[] {
  const orgOnly = ORG_ONLY_SUFFIX[role] ?? new Set<string>();

  return getAppNavForRole(role).map((item) => {
    const suffix = item.navKey;
    if (orgOnly.has(suffix)) {
      return { ...item, href: buildOrgScopedPath(orgId, role, suffix) };
    }
    if (!locationId) {
      return {
        ...item,
        href: buildOrgScopedPath(orgId, role, "workspace"),
      };
    }
    return {
      ...item,
      href: buildBranchScopedPath(orgId, locationId, role, suffix),
    };
  });
}
