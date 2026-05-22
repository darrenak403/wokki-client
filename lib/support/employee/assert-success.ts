import { mapEmployeeResponseFailure } from "@/lib/support/employee/map-errors";
import type { ApiResponse } from "@/types/api";

export function assertEmployeeSuccess<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    const message = mapEmployeeResponseFailure(response);
    throw {
      message,
      messageCode: response.message.code,
      status: false,
      data: response,
    };
  }
  return response.data;
}
