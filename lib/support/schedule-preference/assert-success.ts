import { mapSchedulePreferenceResponseFailure } from "@/lib/support/schedule-preference/map-errors";
import type { ApiResponse } from "@/types/api";

export function assertSchedulePreferenceSuccess<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    const message = mapSchedulePreferenceResponseFailure(response);
    throw {
      message,
      messageCode: response.message.code,
      status: false,
      data: response,
    };
  }
  return response.data as T;
}
