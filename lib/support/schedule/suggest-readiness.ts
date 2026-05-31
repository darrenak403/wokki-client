export function buildReadinessLine(
  reason: string | null,
  hasGenerated: boolean,
  suggestionCount: number,
): string | null {
  if (!hasGenerated) return null;

  if (suggestionCount > 0) return null;

  switch (reason) {
    case "no_employees":
    case "missing_department_memberships":
      return "Thiếu nhân viên active thuộc phòng ban — kiểm tra danh sách nhân viên.";
    case "no_shifts":
      return "Chưa có ca active — thiết lập ca trước khi gợi ý.";
    case "missing_preferences":
      return "Chưa có đăng ký ca đã gửi — nhắc nhân viên gửi bảng đăng ký.";
    case "partial_coverage":
      return "Thiếu nhân sự so với số ca — xem gợi ý một phần bên dưới hoặc thêm nhân viên.";
    case "infeasible":
      return "Solver không tìm lịch hợp lệ — kiểm tra nhân sự, ca trùng giờ, hoặc đăng ký Unavailable.";
    default:
      return reason ? `Không tạo được gợi ý: ${reason}` : "Không có gợi ý phù hợp cho tuần này.";
  }
}
