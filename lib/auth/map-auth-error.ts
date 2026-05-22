import type { ApiError } from "@/types/api";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  AUTH_UNAUTHORIZED: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  AUTH_NOT_LOGGED_IN: "Bạn chưa đăng nhập.",
  AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  USER_EXISTS: "Email đã được sử dụng.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

const GENERIC_AUTH_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

const TECHNICAL_MESSAGE_PATTERN =
  /request failed|network error|status code \d+|axios|econnrefused|timeout/i;

function isErrorCode(value: string): boolean {
  return /^[A-Z][A-Z0-9_]*$/.test(value);
}

/** Safe message for API `message` fields shown in UI. */
export function mapAuthFailureMessage(message?: string): string {
  if (!message?.trim()) return GENERIC_AUTH_ERROR;
  const trimmed = message.trim();

  if (TECHNICAL_MESSAGE_PATTERN.test(trimmed)) return GENERIC_AUTH_ERROR;

  if (isErrorCode(trimmed)) {
    return AUTH_ERROR_MESSAGES[trimmed] ?? GENERIC_AUTH_ERROR;
  }

  return trimmed;
}

export function mapAuthError(error: unknown): string {
  if (!error) return GENERIC_AUTH_ERROR;

  if (typeof error === "string") return mapAuthFailureMessage(error);

  const apiError = error as ApiError;
  const body = apiError.data as { code?: string; message?: string } | undefined;
  const code = body?.code;

  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }

  if (apiError.message) return mapAuthFailureMessage(apiError.message);

  return GENERIC_AUTH_ERROR;
}
