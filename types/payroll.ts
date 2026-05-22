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
  hourlyRate: number;
  grossPay: number;
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

export interface PayrollEmployeeDetailResponse extends PayrollLineResponse {
  attendanceItems: PayrollAttendanceItem[];
}

export interface PayrollSummaryParams {
  departmentId: string;
  startDate: string;
  endDate: string;
}

export interface PayrollExportRequest {
  departmentId: string;
  startDate: string;
  endDate: string;
}
