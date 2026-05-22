import { mapFoundationResponseFailure } from "@/lib/support/foundation/map-errors";
import type { ApiResponse } from "@/types/api";

export function assertFoundationSuccess<T>(response: ApiResponse<T>): T {
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
