"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { payrollKeys } from "@/lib/api/query-keys";
import { fetchPayroll } from "@/lib/api/services/fetchPayroll";
import { downloadCsvBlob } from "@/lib/support/payroll/download-csv";
import { mapPayrollError } from "@/lib/support/payroll/map-errors";
import type { PayrollExportRequest, PayrollSummaryParams } from "@/types/payroll";

const STALE_MS = 60 * 1000;

export function usePayrollSummaryQuery(params: PayrollSummaryParams | null) {
  return useQuery({
    queryKey: payrollKeys.summary(params ?? {}),
    queryFn: () => fetchPayroll.getSummary(params!),
    enabled: Boolean(params?.departmentId && params.startDate && params.endDate),
    staleTime: STALE_MS,
  });
}

export function usePayrollEmployeeDetailQuery(
  employeeId: string | null,
  params: PayrollSummaryParams | null,
  enabled = false,
) {
  return useQuery({
    queryKey: payrollKeys.employeeDetail(employeeId ?? "", params ?? {}),
    queryFn: () => fetchPayroll.getEmployeeDetail(employeeId!, params!),
    enabled:
      enabled &&
      Boolean(employeeId && params?.departmentId && params.startDate && params.endDate),
    staleTime: STALE_MS,
  });
}

export function useExportPayrollCsvMutation() {
  return useMutation({
    mutationFn: (body: PayrollExportRequest) => fetchPayroll.exportCsv(body),
    onSuccess: ({ blob, filename }) => {
      downloadCsvBlob(blob, filename);
      toast.success("Đã tải file CSV lương.");
    },
    onError: (error) => toast.error(mapPayrollError(error)),
  });
}
