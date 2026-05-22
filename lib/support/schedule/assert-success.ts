import { mapScheduleResponseFailure } from "@/lib/support/schedule/map-errors";
import type { ApiResponse } from "@/types/api";

export function assertScheduleSuccess<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    const message = mapScheduleResponseFailure(response);
    throw {
      message,
      messageCode: response.message.code,
      status: false,
      data: response,
    };
  }
  return response.data;
}
