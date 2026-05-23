import { extractApiMessage } from "@/lib/api/normalize-response";
import { mapAuthFailureMessage } from "@/lib/support/auth/map-auth-error";
import type { ApiError, ApiResponse } from "@/types/api";

const SCHEDULE_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  SCHEDULE_NOT_DRAFT: "Chỉ có thể sửa lịch ở trạng thái Nháp.",
  SCHEDULE_WEEK_NOT_MONDAY: "Ngày bắt đầu tuần phải là thứ Hai.",
  SCHEDULE_EMPLOYEE_WRONG_DEPT: "Nhân viên không thuộc phòng ban của lịch.",
  SCHEDULE_SHIFT_WRONG_SCOPE: "Ca không thuộc phạm vi chi nhánh/phòng ban.",
  SCHEDULE_SHIFT_INACTIVE: "ca làm việc không còn hoạt động.",
  SCHEDULE_ALREADY_PUBLISHED: "Lịch đã được công bố.",
  SCHEDULE_NOT_PUBLISHED: "Lịch chưa được công bố.",
  SCHEDULE_SUGGESTIONS_EMPTY: "Không có gợi ý để áp dụng.",
  SCHEDULE_ROSTER_RANGE_INVALID: "Khoảng ngày không hợp lệ (tối đa 28 ngày).",
  SCHEDULE_LOCATION_AMBIGUOUS: "Chọn phòng ban để xem lịch.",
  SCHEDULE_LOCATION_NOT_FOUND: "Không tìm thấy chi nhánh.",
  SCHEDULE_NOT_FOUND: "Không tìm thấy lịch.",
  SCHEDULE_ASSIGNMENT_NOT_FOUND: "Không tìm thấy phân ca.",
  SCHEDULE_DEPARTMENT_NOT_FOUND: "Không tìm thấy phòng ban.",
  SCHEDULE_EMPLOYEE_NOT_FOUND: "Không tìm thấy nhân viên.",
  SCHEDULE_ALREADY_EXISTS: "Đã có lịch cho phòng ban và tuần này.",
  SCHEDULE_COPY_TARGET_NOT_DRAFT:
    "Tuần đích đã công bố — huỷ công bố hoặc chọn tuần khác trước khi sao chép.",
  SCHEDULE_COPY_SAME_WEEK: "Tuần nguồn và tuần đích phải khác nhau.",
  SCHEDULE_ASSIGNMENT_CONFLICT: "Trùng khung giờ trong cùng ngày.",
  SCHEDULE_ASSIGNMENT_DUPLICATE: "Phân ca trùng (ca, nhân viên, ngày).",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

const GENERIC_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

function mapCode(code?: string): string | null {
  if (!code) return null;
  return SCHEDULE_ERROR_MESSAGES[code] ?? null;
}

export function mapScheduleFailureMessage(message?: unknown, messageCode?: string): string {
  const authMapped = mapAuthFailureMessage(message, messageCode);
  if (messageCode && mapCode(messageCode)) return mapCode(messageCode)!;
  const parsed = extractApiMessage(message);
  const fromCode = mapCode(parsed.code);
  if (fromCode) return fromCode;
  if (authMapped !== GENERIC_ERROR) return authMapped;
  if (parsed.text.trim()) return parsed.text.trim();
  return GENERIC_ERROR;
}

export function mapScheduleResponseFailure(
  response: Pick<ApiResponse<unknown>, "message">
): string {
  return mapScheduleFailureMessage(response.message, response.message.code);
}

export function mapScheduleError(error: unknown): string {
  if (!error) return GENERIC_ERROR;
  if (typeof error === "string") return mapScheduleFailureMessage(error);

  const apiError = error as ApiError;
  if (apiError.messageCode) {
    const mapped = mapCode(apiError.messageCode);
    if (mapped) return mapped;
  }

  const body = apiError.data as Record<string, unknown> | undefined;
  const fromBody = extractApiMessage(body?.message);
  const code =
    apiError.messageCode ?? (typeof fromBody.code === "string" ? fromBody.code : undefined);
  const mapped = mapCode(code);
  if (mapped) return mapped;

  if (typeof apiError.message === "string" && apiError.message.trim()) {
    return apiError.message.trim();
  }

  return GENERIC_ERROR;
}
