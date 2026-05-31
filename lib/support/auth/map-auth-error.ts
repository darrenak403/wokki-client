import { extractApiMessage } from "@/lib/api/normalize-response";
import type { ApiError, ApiResponse } from "@/types/api";

import { orgPackageUserMessage, isOrgPackageCode } from "@/lib/support/auth/org-package";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  ORG_PACKAGE_NOT_ACTIVATED: orgPackageUserMessage("ORG_PACKAGE_NOT_ACTIVATED"),
  ORG_PACKAGE_EXPIRED: orgPackageUserMessage("ORG_PACKAGE_EXPIRED"),
  AUTH_INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác.",
  AUTH_UNAUTHORIZED: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  AUTH_NOT_LOGGED_IN: "Bạn chưa đăng nhập.",
  AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  AUTH_PASSWORD_CONFIRM_MISMATCH: "Mật khẩu mới và xác nhận không khớp.",
  AUTH_OTP_INVALID: "Mã OTP không hợp lệ hoặc đã hết hạn.",
  AUTH_OTP_NOT_VERIFIED: "Vui lòng xác minh mã OTP trước khi đặt mật khẩu mới.",
  AUTH_OTP_RESEND_TOO_SOON: "Vui lòng đợi mã hiện tại hết hạn (1 phút) trước khi gửi lại.",
  AUTH_OTP_SEND_LOCKED: "Gửi OTP quá nhiều lần. Thử lại sau 30 phút.",
  AUTH_OTP_SENT: "Nếu email tồn tại, mã xác minh đã được gửi.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

const GENERIC_AUTH_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

const TECHNICAL_MESSAGE_PATTERN =
  /request failed|network error|status code \d+|axios|econnrefused|timeout/i;

function isErrorCode(value: string): boolean {
  return /^[A-Z][A-Z0-9_]*$/.test(value);
}

function mapCode(code?: string): string | null {
  if (!code) return null;
  if (isOrgPackageCode(code)) return orgPackageUserMessage(code);
  return AUTH_ERROR_MESSAGES[code] ?? null;
}

/** Safe message for API `message` fields shown in UI. */
export function mapAuthFailureMessage(message?: unknown, messageCode?: string): string {
  const mapped = mapCode(messageCode);
  if (mapped) return mapped;

  const parsed = extractApiMessage(message);
  const fromCode = mapCode(parsed.code);
  if (fromCode) return fromCode;

  if (!parsed.text.trim()) return GENERIC_AUTH_ERROR;

  const trimmed = parsed.text.trim();

  if (TECHNICAL_MESSAGE_PATTERN.test(trimmed)) return GENERIC_AUTH_ERROR;

  if (isErrorCode(trimmed)) {
    return AUTH_ERROR_MESSAGES[trimmed] ?? GENERIC_AUTH_ERROR;
  }

  return trimmed;
}

export function mapAuthResponseFailure(response: Pick<ApiResponse<unknown>, "message">): string {
  return mapAuthFailureMessage(response.message, response.message.code);
}

export function mapAuthError(error: unknown): string {
  if (!error) return GENERIC_AUTH_ERROR;

  if (typeof error === "string") return mapAuthFailureMessage(error);

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

  const messageText = typeof apiError.message === "string" ? apiError.message : fromBody.text;

  if (messageText) return mapAuthFailureMessage(messageText);

  return GENERIC_AUTH_ERROR;
}
