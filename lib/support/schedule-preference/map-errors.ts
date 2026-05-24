import { extractApiMessage } from "@/lib/api/normalize-response";
import { mapAuthFailureMessage } from "@/lib/support/auth/map-auth-error";
import type { ApiError, ApiResponse } from "@/types/api";

const PREFERENCE_ERROR_MESSAGES: Record<string, string> = {
  SCHEDULE_PREFERENCE_WRONG_DEPT: "Bạn không thuộc phòng ban của lịch này.",
  SCHEDULE_PREFERENCE_INVALID_SHIFT: "Ca không hợp lệ cho lịch tuần này.",
  SCHEDULE_PREFERENCE_DATE_OUT_OF_RANGE: "Ngày nằm ngoài tuần của lịch.",
  SCHEDULE_PREFERENCE_INVALID_TYPE: "Loại đăng ký không hợp lệ.",
  SCHEDULE_PREFERENCE_ALREADY_SUBMITTED:
    "Đã gửi đăng ký. Bấm «Chỉnh sửa đăng ký», lưu nháp rồi «Gửi lại đăng ký».",
  SCHEDULE_PREFERENCE_EMPTY: "Cần ít nhất một ô đăng ký trước khi gửi.",
  SCHEDULE_NOT_DRAFT: "Chỉ đăng ký ca khi lịch tuần đang ở trạng thái Nháp.",
  SCHEDULE_NOT_FOUND: "Không tìm thấy lịch tuần.",
  ME_NO_EMPLOYEE: "Tài khoản chưa liên kết hồ sơ nhân viên.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
  SCHEDULE_PREFERENCE_STALE:
    "Dữ liệu đăng ký đã thay đổi (vd. sau sao chép tuần). Đang tải lại — vui lòng lưu lại.",
};

const GENERIC_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

function mapCode(code?: string): string | null {
  if (!code) return null;
  return PREFERENCE_ERROR_MESSAGES[code] ?? null;
}

export function mapSchedulePreferenceFailureMessage(
  message?: unknown,
  messageCode?: string,
): string {
  const authMapped = mapAuthFailureMessage(message, messageCode);
  if (messageCode && mapCode(messageCode)) return mapCode(messageCode)!;
  const parsed = extractApiMessage(message);
  const fromCode = mapCode(parsed.code);
  if (fromCode) return fromCode;
  if (authMapped !== GENERIC_ERROR) return authMapped;
  if (parsed.text.trim()) return parsed.text.trim();
  return GENERIC_ERROR;
}

export function mapSchedulePreferenceResponseFailure(
  response: Pick<ApiResponse<unknown>, "message">,
): string {
  return mapSchedulePreferenceFailureMessage(response.message, response.message.code);
}

export function mapSchedulePreferenceError(error: unknown): string {
  if (!error) return GENERIC_ERROR;
  if (typeof error === "string") return mapSchedulePreferenceFailureMessage(error);

  const apiError = error as ApiError;
  if (apiError.messageCode) {
    const mapped = mapCode(apiError.messageCode);
    if (mapped) return mapped;
  }

  if (typeof apiError.message === "string" && apiError.message.trim()) {
    return apiError.message.trim();
  }

  return GENERIC_ERROR;
}
