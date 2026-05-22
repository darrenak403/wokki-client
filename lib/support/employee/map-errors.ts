import { extractApiMessage } from "@/lib/api/normalize-response";
import { mapAuthFailureMessage } from "@/lib/support/auth/map-auth-error";
import type { ApiError, ApiResponse } from "@/types/api";

const EMPLOYEE_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  ME_NO_EMPLOYEE: "Tài khoản chưa được liên kết nhân viên. Liên hệ quản lý.",
  SWAP_NO_EMPLOYEE: "Tài khoản chưa được liên kết nhân viên.",
  ATTENDANCE_NO_EMPLOYEE: "Tài khoản chưa được liên kết nhân viên.",
  SWAP_NOT_FOUND: "Không tìm thấy yêu cầu đổi ca.",
  SWAP_ASSIGNMENT_NOT_FOUND: "Không tìm thấy phân ca.",
  ATTENDANCE_NO_ASSIGNMENT: "Hôm nay bạn không có ca để chấm công.",
  SWAP_NOT_OWNER: "Bạn không phải người liên quan yêu cầu này.",
  SWAP_FORBIDDEN: "Không được phép thực hiện thao tác này.",
  SWAP_CUTOFF_EXCEEDED: "Đã quá hạn đổi ca tuần sau.",
  SWAP_SAME_EMPLOYEE: "Không thể đổi ca với chính mình.",
  SWAP_SCHEDULE_NOT_PUBLISHED: "Lịch chưa được công bố.",
  ATTENDANCE_NO_OPEN: "Chưa có lần chấm công đang mở.",
  SWAP_OPEN_EXISTS: "Đã có yêu cầu đổi ca đang chờ cho phân ca này.",
  SWAP_INVALID_TRANSITION: "Không thể chuyển trạng thái yêu cầu.",
  SWAP_PEER_ACCEPTED_EXISTS: "Yêu cầu đã được xử lý.",
  ATTENDANCE_OPEN_EXISTS: "Bạn đang có lần chấm công chưa kết thúc.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

const GENERIC_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

function mapCode(code?: string): string | null {
  if (!code) return null;
  return EMPLOYEE_ERROR_MESSAGES[code] ?? null;
}

export function mapEmployeeFailureMessage(message?: unknown, messageCode?: string): string {
  const authMapped = mapAuthFailureMessage(message, messageCode);
  if (messageCode && mapCode(messageCode)) return mapCode(messageCode)!;
  const parsed = extractApiMessage(message);
  const fromCode = mapCode(parsed.code);
  if (fromCode) return fromCode;
  if (authMapped !== GENERIC_ERROR) return authMapped;
  if (parsed.text.trim()) return parsed.text.trim();
  return GENERIC_ERROR;
}

export function mapEmployeeResponseFailure(
  response: Pick<ApiResponse<unknown>, "message">,
): string {
  return mapEmployeeFailureMessage(response.message, response.message.code);
}

export function mapEmployeeError(error: unknown): string {
  if (!error) return GENERIC_ERROR;
  if (typeof error === "string") return mapEmployeeFailureMessage(error);

  const apiError = error as ApiError;
  if (apiError.httpStatus === 429) {
    return "Quá nhiều thao tác chấm công. Vui lòng thử lại sau vài giây.";
  }
  if (apiError.messageCode) {
    const mapped = mapCode(apiError.messageCode);
    if (mapped) return mapped;
  }

  const body = apiError.data as Record<string, unknown> | undefined;
  const fromBody = extractApiMessage(body?.message);
  const code =
    apiError.messageCode ??
    (typeof fromBody.code === "string" ? fromBody.code : undefined);
  const mapped = mapCode(code);
  if (mapped) return mapped;

  if (typeof apiError.message === "string" && apiError.message.trim()) {
    return apiError.message.trim();
  }

  return GENERIC_ERROR;
}
