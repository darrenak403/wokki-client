import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import { assertPayrollSuccess } from "@/lib/support/payroll/assert-success";
import { mapPayrollError } from "@/lib/support/payroll/map-errors";
import { parseContentDispositionFilename } from "@/lib/support/payroll/download-csv";
import type { ApiEnvelope } from "@/types/api";
import type {
  MyPayrollSummaryResponse,
  PayrollEmployeeDetailResponse,
  PayrollExportRequest,
  PayrollLineResponse,
  PayrollSummaryParams,
  PayrollSummaryResponse,
} from "@/types/payroll";

function summaryQuery(params: PayrollSummaryParams): Record<string, string | boolean> {
  const q: Record<string, string | boolean> = {
    departmentId: params.departmentId,
    startDate: params.startDate,
    endDate: params.endDate,
  };
  if (params.unpaidOnly) q.unpaidOnly = true;
  return q;
}

export const fetchPayroll = {
  getSummary: async (params: PayrollSummaryParams): Promise<PayrollSummaryResponse> => {
    const response = await apiService.get<ApiEnvelope<PayrollSummaryResponse>>(
      "api/v1/payroll/summary",
      summaryQuery(params),
    );
    return assertPayrollSuccess(normalizeApiResponse(response.data));
  },

  getEmployeeDetail: async (
    employeeId: string,
    params: PayrollSummaryParams,
  ): Promise<PayrollEmployeeDetailResponse> => {
    const response = await apiService.get<ApiEnvelope<PayrollEmployeeDetailResponse>>(
      `api/v1/payroll/summary/${employeeId}`,
      summaryQuery(params),
    );
    return assertPayrollSuccess(normalizeApiResponse(response.data));
  },

  getMySummary: async (startDate: string, endDate: string): Promise<MyPayrollSummaryResponse> => {
    const response = await apiService.get<ApiEnvelope<MyPayrollSummaryResponse>>(
      "api/v1/payroll/my-summary",
      { startDate, endDate },
    );
    return assertPayrollSuccess(normalizeApiResponse(response.data));
  },

  lockPeriod: async (payPeriodId: string): Promise<PayrollSummaryResponse> => {
    const response = await apiService.post<ApiEnvelope<PayrollSummaryResponse>>(
      `api/v1/payroll/periods/${payPeriodId}/lock`,
      {},
    );
    return assertPayrollSuccess(normalizeApiResponse(response.data));
  },

  setLinePaid: async (
    payPeriodId: string,
    employeeId: string,
    paid: boolean,
  ): Promise<PayrollLineResponse> => {
    const response = await apiService.patch<ApiEnvelope<PayrollLineResponse>>(
      `api/v1/payroll/periods/${payPeriodId}/employees/${employeeId}/paid`,
      { paid },
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
