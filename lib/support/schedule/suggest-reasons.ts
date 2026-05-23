const SUGGEST_REASON_MESSAGES: Record<string, string> = {
  schedule_not_draft: "Lịch không còn ở trạng thái Nháp.",
  insufficient_history: "Chưa đủ dữ liệu lịch cũ để gợi ý.",
  no_employees: "Không có nhân viên active trong phòng ban.",
  no_shifts: "Không có ca active cho phòng ban.",
  bedrock_truncated: "AI trả về dữ liệu bị cắt — đã thử gợi ý cơ bản nếu bật AI.",
  bedrock_empty: "AI không trả kết quả.",
  bedrock_invalid_ids: "AI trả ID không hợp lệ.",
  bedrock_error: "Lỗi khi gọi Bedrock.",
};

export function mapSuggestReason(reason: string | null | undefined): string {
  if (!reason?.trim()) return "Không có gợi ý phù hợp cho tuần này.";
  return SUGGEST_REASON_MESSAGES[reason] ?? reason;
}
