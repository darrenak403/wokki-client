import { extractApiMessage } from "@/lib/api/normalize-response";
import { mapAuthFailureMessage } from "@/lib/support/auth/map-auth-error";
import type { ApiError, ApiResponse } from "@/types/api";

const PAYROLL_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  PAYROLL_INVALID_RANGE: "Khoảng ngày lương không hợp lệ.",
  PAYROLL_EXPORT_TOO_LARGE: "Quá nhiều dòng để xuất (tối đa 500). Thu hẹp kỳ hoặc phòng ban.",
  PAYROLL_PERIOD_OVERLAP: "Kỳ lương trùng với kỳ đã có.",
  PAYROLL_DEPARTMENT_NOT_FOUND: "Không tìm thấy phòng ban.",
  PAYROLL_EMPLOYEE_NOT_FOUND: "Không tìm thấy nhân viên trong kỳ lương.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

const GENERIC_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

function mapCode(code?: string): string | null {
  if (!code) return null;
  return PAYROLL_ERROR_MESSAGES[code] ?? null;
}

export function mapPayrollFailureMessage(message?: unknown, messageCode?: string): string {
  const authMapped = mapAuthFailureMessage(message, messageCode);
  if (messageCode && mapCode(messageCode)) return mapCode(messageCode)!;
  const parsed = extractApiMessage(message);
  const fromCode = mapCode(parsed.code);
  if (fromCode) return fromCode;
  if (authMapped !== GENERIC_ERROR) return authMapped;
  if (parsed.text.trim()) return parsed.text.trim();
  return GENERIC_ERROR;
}

export function mapPayrollResponseFailure(
  response: Pick<ApiResponse<unknown>, "message">,
): string {
  return mapPayrollFailureMessage(response.message, response.message.code);
}

export function mapPayrollError(error: unknown): string {
  if (!error) return GENERIC_ERROR;
  if (typeof error === "string") return mapPayrollFailureMessage(error);

  const apiError = error as ApiError;
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
