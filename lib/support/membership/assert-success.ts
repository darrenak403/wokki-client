import { mapMembershipResponseFailure } from "@/lib/support/membership/map-errors";
import type { ApiResponse } from "@/types/api";

export function assertMembershipSuccess<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    const message = mapMembershipResponseFailure(response);
    throw {
      message,
      messageCode: response.message.code,
      status: false,
      data: response,
    };
  }
  return response.data;
}
