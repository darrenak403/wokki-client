import { mapChatResponseFailure } from "@/lib/support/chat/map-errors";
import type { ApiResponse } from "@/types/api";

export function assertChatSuccess<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    const message = mapChatResponseFailure(response);
    throw {
      message,
      messageCode: response.message.code,
      status: false,
      data: response,
    };
  }
  return response.data;
}
