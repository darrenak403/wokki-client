/** BE PayPeriodStatus */
export type PayPeriodStatus = 0 | 1;

export const PAY_PERIOD_STATUS = {
  Open: 0,
  Locked: 1,
} as const satisfies Record<string, PayPeriodStatus>;

export interface PayrollLineResponse {
  employeeId: string;
  firstName: string;
  lastName: string;
  totalWorkedMinutes: number;
  regularMinutes: number;
  hourlyRate: number;
  grossPay: number;
  approvedOvertimeMinutes: number;
  overtimePay: number;
  isPaid: boolean;
  bankAccountNumber?: string | null;
  bankAccountHolderName?: string | null;
  bankName?: string | null;
  paymentQrImageUrl?: string | null;
}

export interface PayrollSummaryResponse {
  payPeriodId: string;
  departmentId: string;
  startDate: string;
  endDate: string;
  status: PayPeriodStatus;
  lines: PayrollLineResponse[];
  totalGrossPay: number;
}

export interface PayrollAttendanceItem {
  id: string;
  assignmentId: string;
  clockIn: string;
  clockOut: string | null;
  workedMinutes: number;
}

export interface PayrollEmployeeDetailResponse extends Omit<PayrollLineResponse, "regularMinutes"> {
  payPeriodId: string;
  startDate: string;
  endDate: string;
  attendanceItems: PayrollAttendanceItem[];
}

export interface PayrollSummaryParams {
  departmentId: string;
  startDate: string;
  endDate: string;
  unpaidOnly?: boolean;
}

export interface PayrollExportRequest {
  departmentId: string;
  startDate: string;
  endDate: string;
}

export interface MyPayrollSummaryResponse {
  startDate: string;
  endDate: string;
  periodStatus: PayPeriodStatus | null;
  totalWorkedMinutes: number;
  regularMinutes: number;
  approvedOvertimeMinutes: number;
  hourlyRate: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
}
