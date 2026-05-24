import { extractApiMessage } from "@/lib/api/normalize-response";
import { mapAuthFailureMessage } from "@/lib/support/auth/map-auth-error";
import type { ApiError, ApiResponse } from "@/types/api";

const CONFIG_ERROR_MESSAGES: Record<string, string> = {
  JOB_POSITION_INVALID_HEADCOUNT: "Headcount mục tiêu phải ≥ 1.",
  JOB_POSITION_NOT_FOUND: "Không tìm thấy vị trí.",
  SCHEDULE_DEPARTMENT_NOT_FOUND: "Không tìm thấy phòng ban.",
  AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

const GENERIC_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

function mapCode(code?: string): string | null {
  if (!code) return null;
  return CONFIG_ERROR_MESSAGES[code] ?? null;
}

export function mapSchedulingConfigFailureMessage(
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

export function mapSchedulingConfigResponseFailure(
  response: Pick<ApiResponse<unknown>, "message">,
): string {
  return mapSchedulingConfigFailureMessage(response.message, response.message.code);
}

export function mapSchedulingConfigError(error: unknown): string {
  if (!error) return GENERIC_ERROR;
  if (typeof error === "string") return mapSchedulingConfigFailureMessage(error);

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
