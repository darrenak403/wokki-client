/** BE OvertimeStatus enum serialized as integer */
export type OvertimeStatus = 0 | 1 | 2 | 3 | 4;

export const OVERTIME_STATUS = {
  Pending: 0,
  PendingApproval: 1,
  Approved: 2,
  Rejected: 3,
  AutoClosed: 4,
} as const satisfies Record<string, OvertimeStatus>;

export interface OvertimeRequestResponse {
  id: string;
  shiftAssignmentId: string;
  employeeId: string;
  employeeFirstName?: string | null;
  employeeLastName?: string | null;
  reason: string;
  startedAt: string;
  endedAt: string | null;
  overtimeMinutes: number | null;
  status: OvertimeStatus;
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  shiftName?: string | null;
  scheduledDate?: string | null;
  departmentId?: string | null;
}

export interface SubmitOvertimeRequestDto {
  shiftAssignmentId: string;
  reason: string;
}

export interface OvertimeActionRequest {
  reviewNote?: string | null;
}

export interface OvertimeListParams {
  status?: OvertimeStatus;
  departmentId?: string;
  shiftAssignmentId?: string;
  page?: number;
  pageSize?: number;
}
