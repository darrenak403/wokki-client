import type { AppRole } from "@/lib/types/roles";
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";

export type AppNavItem = {
  href: string;
  label: string;
  description?: string;
  /** Wave / module — ghi chú cho agent, không hiển thị UI */
  module?: string;
  /** Hiển thị badge pending swap (Wave 5) */
  showSwapPendingBadge?: boolean;
};

const ADMIN_NAV: AppNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", description: "Khu quản trị người dùng, dữ liệu nền và vận hành toàn hệ thống.", module: "core" },
  { href: "/admin/locations", label: "Chi nhánh", description: "Quản lý chi nhánh và múi giờ làm việc.", module: "wave2" },
  { href: "/admin/departments", label: "Phòng ban", description: "Chọn chi nhánh để xem và quản lý phòng ban.", module: "wave2" },
  { href: "/admin/shifts", label: "Ca làm việc", description: "Định nghĩa ca sáng, chiều, tối trước khi xếp lịch tuần.", module: "wave2" },
  { href: "/admin/employees", label: "Nhân sự", description: "Quản lý nhân viên và tài khoản hệ thống.", module: "wave2" },
  { href: "/admin/schedule", label: "Lịch ca", description: "Phân ca theo phòng ban và tuần, sau đó công bố cho nhân viên.", module: "wave3" },
  { href: "/admin/swap", label: "Đổi ca", description: "Duyệt hoặc từ chối yêu cầu đổi ca đang chờ.", module: "wave5", showSwapPendingBadge: true },
  { href: "/admin/attendance", label: "Chấm công", description: "Xem và điều chỉnh chấm công nhân viên.", module: "wave5" },
  { href: "/admin/payroll", label: "Lương", description: "Tổng lương theo phòng ban và kỳ, hỗ trợ xuất CSV.", module: "wave5" },
  { href: "/admin/chat", label: "Tin nhắn", description: "Chat nội bộ, tạo kênh, gửi tin và duyệt tin.", module: "wave6" },
];

const MANAGER_NAV: AppNavItem[] = [
  { href: "/manager/dashboard", label: "Dashboard", description: "Khu quản lý lịch ca, chấm công, đổi ca và báo cáo.", module: "core" },
  { href: "/manager/locations", label: "Chi nhánh", description: "Xem danh sách chi nhánh trong phạm vi quản lý.", module: "wave2" },
  { href: "/manager/departments", label: "Phòng ban", description: "Xem phòng ban theo chi nhánh.", module: "wave2" },
  { href: "/manager/shifts", label: "Ca làm việc", description: "Định nghĩa và quản lý ca làm trước khi xếp lịch tuần.", module: "wave2" },
  { href: "/manager/employees", label: "Nhân sự", description: "Danh sách nhân viên trong phạm vi quản lý.", module: "wave2" },
  { href: "/manager/schedule", label: "Lịch ca", description: "Phân ca theo phòng ban và tuần, sau đó công bố cho nhân viên.", module: "wave3" },
  { href: "/manager/swap", label: "Đổi ca", description: "Duyệt hoặc từ chối yêu cầu đổi ca đang chờ.", module: "wave5", showSwapPendingBadge: true },
  { href: "/manager/attendance", label: "Chấm công", description: "Xem và điều chỉnh chấm công nhân viên.", module: "wave5" },
  { href: "/manager/payroll", label: "Lương", description: "Tổng lương theo phòng ban và kỳ.", module: "wave5" },
  { href: "/manager/chat", label: "Tin nhắn", description: "Chat nội bộ, tạo kênh và nhắn với team.", module: "wave6" },
];

const USER_NAV: AppNavItem[] = [
  { href: "/user/dashboard", label: "Dashboard", description: "Khu làm việc dành cho nhân viên trong Wokki.", module: "core" },
  { href: "/user/schedule", label: "Lịch của tôi", description: "Ca đã công bố trong 28 ngày tới, chỉ xem và không chỉnh sửa.", module: "wave4" },
  { href: "/user/swap", label: "Đổi ca", description: "Gửi yêu cầu đổi ca hoặc phản hồi yêu cầu từ đồng nghiệp.", module: "wave4" },
  { href: "/user/attendance", label: "Chấm công", description: "Chấm vào hoặc ra khi có ca hôm nay.", module: "wave4" },
  { href: "/user/chat", label: "Tin nhắn", description: "Chat với đồng nghiệp và quản lý.", module: "wave6" },
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
