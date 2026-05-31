"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useMyPayrollSummaryQuery(startDate: string, endDate: string, enabled = true) {
  return useQuery({
    queryKey: payrollKeys.mySummary({ startDate, endDate }),
    queryFn: () => fetchPayroll.getMySummary(startDate, endDate),
    enabled: enabled && Boolean(startDate && endDate),
    staleTime: STALE_MS,
  });
}

export function useLockPayrollPeriodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payPeriodId: string) => fetchPayroll.lockPeriod(payPeriodId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toast.success("Đã chốt kỳ lương.");
    },
    onError: (error) => toast.error(mapPayrollError(error)),
  });
}

export function useSetPayrollLinePaidMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payPeriodId,
      employeeId,
      paid,
    }: {
      payPeriodId: string;
      employeeId: string;
      paid: boolean;
    }) => fetchPayroll.setLinePaid(payPeriodId, employeeId, paid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toast.success("Đã cập nhật trạng thái chuyển lương.");
    },
    onError: (error) => toast.error(mapPayrollError(error)),
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
