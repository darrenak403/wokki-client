import { mapSchedulingConfigResponseFailure } from "@/lib/support/scheduling-config/map-errors";
import type { ApiResponse } from "@/types/api";

export function assertSchedulingConfigSuccess<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    const message = mapSchedulingConfigResponseFailure(response);
    throw {
      message,
      messageCode: response.message.code,
      status: false,
      data: response,
    };
  }
  return response.data;
}
