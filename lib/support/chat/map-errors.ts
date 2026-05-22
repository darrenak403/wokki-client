import { extractApiMessage } from "@/lib/api/normalize-response";
import { mapAuthFailureMessage } from "@/lib/support/auth/map-auth-error";
import type { ApiError, ApiResponse } from "@/types/api";

const CHAT_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  CHAT_NO_EMPLOYEE: "Tài khoản chưa được liên kết nhân viên. Liên hệ quản lý.",
  CHAT_FORBIDDEN: "Bạn không có quyền truy cập kênh này.",
  CHAT_CHANNEL_NOT_FOUND: "Không tìm thấy kênh chat.",
  CHAT_MESSAGE_NOT_FOUND: "Không tìm thấy tin nhắn.",
  CHAT_MEMBER_NOT_FOUND: "Không tìm thấy nhân viên trong kênh.",
  CHAT_BODY_REQUIRED: "Nội dung tin nhắn không được để trống.",
  CHAT_MEMBERS_REQUIRED: "Cần chọn ít nhất một thành viên.",
  CHAT_DIRECT_TWO_MEMBERS: "Kênh Direct chỉ có đúng hai thành viên.",
  CHAT_GROUP_NAME_REQUIRED: "Nhóm chat cần có tên.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

const GENERIC_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

function mapCode(code?: string): string | null {
  if (!code) return null;
  return CHAT_ERROR_MESSAGES[code] ?? null;
}

export function mapChatFailureMessage(message?: unknown, messageCode?: string): string {
  const authMapped = mapAuthFailureMessage(message, messageCode);
  if (messageCode && mapCode(messageCode)) return mapCode(messageCode)!;
  const parsed = extractApiMessage(message);
  const fromCode = mapCode(parsed.code);
  if (fromCode) return fromCode;
  if (authMapped !== GENERIC_ERROR) return authMapped;
  if (parsed.text.trim()) return parsed.text.trim();
  return GENERIC_ERROR;
}

export function mapChatResponseFailure(
  response: Pick<ApiResponse<unknown>, "message">,
): string {
  return mapChatFailureMessage(response.message, response.message.code);
}

export function mapChatError(error: unknown): string {
  if (!error) return GENERIC_ERROR;
  if (typeof error === "string") return mapChatFailureMessage(error);

  const apiError = error as ApiError;
  if (apiError.httpStatus === 429) {
    return "Quá nhiều tin nhắn. Vui lòng thử lại sau.";
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
