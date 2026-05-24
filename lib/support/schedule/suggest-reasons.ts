const SUGGEST_REASON_MESSAGES: Record<string, string> = {
  schedule_not_draft: "Lịch không còn ở trạng thái Nháp.",
  missing_location_rules: "Chi nhánh chưa có luật tổng để chạy auto-scheduling.",
  no_employees: "Không có nhân viên active trong phòng ban.",
  missing_department_memberships: "Phòng ban chưa có membership nhân viên hợp lệ.",
  no_shifts: "Không có ca active cho phòng ban.",
  missing_preferences: "Chưa có đăng ký ca được gửi cho tuần/phòng ban này.",
};

export function mapSuggestReason(reason: string | null | undefined): string {
  if (!reason?.trim()) return "Không có gợi ý phù hợp cho tuần này.";
  return SUGGEST_REASON_MESSAGES[reason] ?? reason;
}
