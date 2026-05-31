const SUGGEST_REASON_MESSAGES: Record<string, string> = {
  schedule_not_draft: "Lịch không còn ở trạng thái Nháp.",
  no_employees: "Không có nhân viên active trong phòng ban.",
  missing_department_memberships: "Phòng ban chưa có membership nhân viên hợp lệ.",
  no_shifts: "Không có ca active cho phòng ban.",
  missing_preferences:
    "Chưa có đăng ký ca được gửi — tắt luật \"Cần đăng ký ca trước\" hoặc nhắc nhân viên gửi bảng đăng ký.",
  partial_coverage:
    "Không đủ nhân viên để phủ hết mọi ca — đã gợi ý phần có thể phân công theo đăng ký và luật nghỉ giữa ca.",
  infeasible:
    "Không tìm được lịch hợp lệ — kiểm tra luật org đang bật, số nhân viên, hoặc đăng ký Unavailable.",
  fully_assigned:
    "Mọi ô ca đã có phân ca cố định và đăng ký chưa đổi sau lần phân ca — xóa một số phân ca trên lưới hoặc nhắc nhân viên gửi lại đăng ký rồi bấm Tạo gợi ý.",
};

export function mapSuggestReason(reason: string | null | undefined): string {
  if (!reason?.trim()) return "Không có gợi ý phù hợp cho tuần này.";
  return SUGGEST_REASON_MESSAGES[reason] ?? reason;
}
