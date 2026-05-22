import { mapFoundationResponseFailure } from "@/lib/auth/map-foundation-error";
import type { ApiResponse } from "@/types/api";

export function assertApiSuccess<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    const message = mapFoundationResponseFailure(response);
    throw {
      message,
      messageCode: response.message.code,
      status: false,
      data: response,
    };
  }
  return response.data;
}
