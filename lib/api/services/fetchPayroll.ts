import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import { assertPayrollSuccess } from "@/lib/support/payroll/assert-success";
import { mapPayrollError } from "@/lib/support/payroll/map-errors";
import { parseContentDispositionFilename } from "@/lib/support/payroll/download-csv";
import type { ApiEnvelope } from "@/types/api";
import type {
  PayrollEmployeeDetailResponse,
  PayrollExportRequest,
  PayrollSummaryParams,
  PayrollSummaryResponse,
} from "@/types/payroll";

export const fetchPayroll = {
  getSummary: async (params: PayrollSummaryParams): Promise<PayrollSummaryResponse> => {
    const response = await apiService.get<ApiEnvelope<PayrollSummaryResponse>>(
      "api/v1/payroll/summary",
      params,
    );
    return assertPayrollSuccess(normalizeApiResponse(response.data));
  },

  getEmployeeDetail: async (
    employeeId: string,
    params: PayrollSummaryParams,
  ): Promise<PayrollEmployeeDetailResponse> => {
    const response = await apiService.get<ApiEnvelope<PayrollEmployeeDetailResponse>>(
      `api/v1/payroll/summary/${employeeId}`,
      params,
    );
    return assertPayrollSuccess(normalizeApiResponse(response.data));
  },

  exportCsv: async (
    body: PayrollExportRequest,
  ): Promise<{ blob: Blob; filename: string }> => {
    const response = await apiService.request<Blob>({
      method: "POST",
      url: "api/v1/payroll/summary/export",
      data: body,
      responseType: "blob",
    });

    const contentType = String(response.headers["content-type"] ?? "");
    if (
      response.status >= 400 ||
      contentType.includes("application/json") ||
      contentType.includes("application/problem+json")
    ) {
      const raw =
        response.data instanceof Blob ? await response.data.text() : String(response.data ?? "");
      let parsed: ApiEnvelope<unknown> | null = null;
      try {
        parsed = JSON.parse(raw) as ApiEnvelope<unknown>;
      } catch {
        throw { message: mapPayrollError(null), status: false, httpStatus: response.status };
      }
      const normalized = normalizeApiResponse(parsed);
      throw {
        message: mapPayrollError({
          messageCode: normalized.message.code,
          message: normalized.message.text,
          status: false,
          httpStatus: response.status,
          data: parsed,
        }),
        messageCode: normalized.message.code,
        status: false,
        httpStatus: response.status,
        data: parsed,
      };
    }

    const filename =
      parseContentDispositionFilename(
        String(response.headers["content-disposition"] ?? ""),
      ) ?? `payroll-${body.startDate}-${body.endDate}.csv`;

    return { blob: response.data, filename };
  },
};
