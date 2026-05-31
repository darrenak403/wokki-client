import { extractApiMessage } from "@/lib/api/normalize-response";
import { mapAuthFailureMessage } from "@/lib/support/auth/map-auth-error";
import type { ApiError, ApiResponse } from "@/types/api";

const MEMBERSHIP_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  VALIDATION_INVALID_PAGE: "Số trang không hợp lệ.",
  VALIDATION_INVALID_PAGE_SIZE: "Kích thước trang không hợp lệ.",
  AUTH_UNAUTHORIZED: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  LM_NO_EMPLOYEE: "Tài khoản này chưa liên kết hồ sơ nhân viên.",
  LM_LOCATION_NOT_FOUND: "Không tìm thấy chi nhánh.",
  LM_NOT_FOUND: "Không tìm thấy yêu cầu tham gia chi nhánh.",
  LM_FORBIDDEN: "Bạn không có quyền quản lý yêu cầu của chi nhánh này.",
  LM_DUPLICATE: "Nhân viên đã có yêu cầu chờ duyệt hoặc đang thuộc chi nhánh này.",
  LM_ACTIVE_CONFLICT: "Nhân viên đã thuộc một chi nhánh khác.",
  LM_INVALID_STATUS: "Chỉ có thể duyệt yêu cầu đang chờ.",
  LMG_LOCATION_NOT_FOUND: "Không tìm thấy chi nhánh.",
  LMG_USER_NOT_FOUND: "Không tìm thấy tài khoản Manager.",
  LMG_NOT_FOUND: "Không tìm thấy phân quyền Manager cho chi nhánh.",
  LMG_ALREADY_ASSIGNED: "Tài khoản này đã là Manager của chi nhánh.",
  WS_CANNOT_MODIFY_ADMIN: "Không thể thay đổi tài khoản Admin.",
  WS_TRANSFER_FORBIDDEN: "Bạn không có quyền điều chuyển nhân viên này.",
  WS_ALREADY_AT_LOCATION: "Nhân viên đã thuộc chi nhánh này.",
  WS_ALREADY_IN_DEPT: "Nhân viên đã ở phòng ban này.",
  WS_EMPLOYEE_WRONG_LOCATION:
    "Nhân viên chưa thuộc chi nhánh của phòng ban này. Hãy điều chuyển chi nhánh trước.",
  EMPLOYEE_NOT_FOUND: "Không tìm thấy nhân viên.",
  EMPLOYEE_ALREADY_TERMINATED: "Nhân viên đã được chấm dứt hợp đồng.",
  EMPLOYEE_DEPARTMENT_NOT_FOUND: "Phòng ban không hợp lệ.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

const GENERIC_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

function mapCode(code?: string): string | null {
  if (!code) return null;
  return MEMBERSHIP_ERROR_MESSAGES[code] ?? null;
}

export function mapMembershipFailureMessage(message?: unknown, messageCode?: string): string {
  const authMapped = mapAuthFailureMessage(message, messageCode);
  if (messageCode && mapCode(messageCode)) return mapCode(messageCode)!;

  const parsed = extractApiMessage(message);
  const fromCode = mapCode(parsed.code);
  if (fromCode) return fromCode;
  if (authMapped !== GENERIC_ERROR) return authMapped;
  if (parsed.text.trim()) return parsed.text.trim();
  return GENERIC_ERROR;
}

export function mapMembershipResponseFailure(
  response: Pick<ApiResponse<unknown>, "message">
): string {
  return mapMembershipFailureMessage(response.message, response.message.code);
}

export function mapMembershipError(error: unknown): string {
  if (!error) return GENERIC_ERROR;
  if (typeof error === "string") return mapMembershipFailureMessage(error);

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
    return mapMembershipFailureMessage(apiError.message, code);
  }

  return GENERIC_ERROR;
}
