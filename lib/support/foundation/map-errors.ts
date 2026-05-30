import { extractApiMessage } from "@/lib/api/normalize-response";
import { mapAuthFailureMessage } from "@/lib/support/auth/map-auth-error";
import type { ApiError, ApiResponse } from "@/types/api";

const FOUNDATION_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  LOCATION_NOT_FOUND: "Không tìm thấy chi nhánh.",
  LOCATION_EXISTS: "Chi nhánh đã tồn tại.",
  DEPARTMENT_NOT_FOUND: "Không tìm thấy phòng ban.",
  DEPARTMENT_LOCATION_NOT_FOUND: "Chi nhánh của phòng ban không hợp lệ.",
  EMPLOYEE_NOT_FOUND: "Không tìm thấy nhân viên.",
  EMPLOYEE_DEPARTMENT_NOT_FOUND: "Phòng ban không hợp lệ.",
  EMPLOYEE_ALREADY_TERMINATED: "Nhân viên đã được chấm dứt hợp đồng.",
  EMPLOYEE_USER_EXISTS: "Email đã được sử dụng cho nhân viên khác.",
  SHIFT_NOT_FOUND: "Không tìm thấy ca làm việc.",
  SHIFT_LOCATION_NOT_FOUND: "Chi nhánh của ca không hợp lệ.",
  SHIFT_INVALID_TIME_RANGE: "Giờ kết thúc phải sau giờ bắt đầu.",
  SHIFT_COPY_SOURCE_NOT_FOUND: "Không tìm thấy phòng ban nguồn hoặc ca để sao chép.",
  SHIFT_COPY_TARGET_INVALID: "Phòng ban đích không hợp lệ.",
  SHIFT_COPY_NOTHING_TO_COPY: "Không có ca đang hoạt động để sao chép.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản.",
  USER_EXISTS: "Email đã được sử dụng.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

const GENERIC_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

function mapCode(code?: string): string | null {
  if (!code) return null;
  return FOUNDATION_ERROR_MESSAGES[code] ?? null;
}

export function mapFoundationFailureMessage(message?: unknown, messageCode?: string): string {
  const authMapped = mapAuthFailureMessage(message, messageCode);
  if (messageCode && mapCode(messageCode)) return mapCode(messageCode)!;
  const parsed = extractApiMessage(message);
  const fromCode = mapCode(parsed.code);
  if (fromCode) return fromCode;
  if (authMapped !== "Đã xảy ra lỗi. Vui lòng thử lại.") return authMapped;
  if (parsed.text.trim()) return parsed.text.trim();
  return GENERIC_ERROR;
}

export function mapFoundationResponseFailure(
  response: Pick<ApiResponse<unknown>, "message">
): string {
  return mapFoundationFailureMessage(response.message, response.message.code);
}

export function mapFoundationError(error: unknown): string {
  if (!error) return GENERIC_ERROR;
  if (typeof error === "string") return mapFoundationFailureMessage(error);

  const apiError = error as ApiError;
  if (apiError.messageCode) {
    const mapped = mapCode(apiError.messageCode);
    if (mapped) return mapped;
  }

  const body = apiError.data as Record<string, unknown> | undefined;
  const fromBody = extractApiMessage(body?.message);
  const code =
    apiError.messageCode ??
    (typeof body?.code === "string" ? body.code : undefined) ??
    fromBody.code;

  const mapped = mapCode(code);
  if (mapped) return mapped;

  if (typeof apiError.message === "string" && apiError.message) {
    return mapFoundationFailureMessage(apiError.message, code);
  }

  return GENERIC_ERROR;
}
