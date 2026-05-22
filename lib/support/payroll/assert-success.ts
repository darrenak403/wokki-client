import { mapPayrollResponseFailure } from "@/lib/support/payroll/map-errors";
import type { ApiResponse } from "@/types/api";

export function assertPayrollSuccess<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    const message = mapPayrollResponseFailure(response);
    throw {
      message,
      messageCode: response.message.code,
      status: false,
      data: response,
    };
  }
  return response.data;
}
