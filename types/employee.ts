import type { ShiftAssignmentResponse } from "@/types/schedule";

export type { ShiftAssignmentResponse };

/** BE SwapStatus */
export type SwapStatus = 0 | 1 | 2 | 3 | 4 | 5;

export const SWAP_STATUS = {
  Pending: 0,
  PeerAccepted: 1,
  PeerDeclined: 2,
  ManagerApproved: 3,
  ManagerRejected: 4,
  Cancelled: 5,
} as const satisfies Record<string, SwapStatus>;

export interface SwapRequestResponse {
  id: string;
  requesterAssignmentId: string;
  targetAssignmentId: string;
  requesterId: string;
  targetEmployeeId: string;
  status: SwapStatus;
  requesterNote: string | null;
  targetNote: string | null;
  managerNote: string | null;
  reviewedBy: string | null;
  requesterShiftDate: string;
  requesterShiftName?: string | null;
  requesterStartTime?: string | null;
  requesterEndTime?: string | null;
  targetShiftDate: string;
  targetShiftName?: string | null;
  targetStartTime?: string | null;
  targetEndTime?: string | null;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSwapRequest {
  requesterAssignmentId: string;
  targetAssignmentId: string;
  requesterNote?: string | null;
}

export interface SwapActionRequest {
  note?: string | null;
}

export type AttendanceStatus = 0 | 1 | 2 | 3;

export const ATTENDANCE_STATUS = {
  Open: 0,
  OnTime: 1,
  Late: 2,
  Adjusted: 3,
} as const satisfies Record<string, AttendanceStatus>;

export interface AttendanceResponse {
  id: string;
  employeeId: string;
  assignmentId: string | null;
  clockIn: string;
  clockOut: string | null;
  workedMinutes: number;
  status: AttendanceStatus;
  adjustedBy: string | null;
  adjustmentNote: string | null;
  createdAt: string;
  shiftDefinitionId?: string | null;
  shiftName?: string | null;
  shiftColor?: string | null;
  scheduledDate?: string | null;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  locationId?: string | null;
  locationName?: string | null;
}

export interface ClockInRequest {
  assignmentId?: string;
}

/** Wave 4 — GET /self/attendance */
export type SelfAttendanceListParams = {
  fromDate?: string;
  toDate?: string;
};

/** Wave 5 — GET /attendance (team, Manager/Admin) */
export type TeamAttendanceListParams = {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  fromDate?: string;
  toDate?: string;
};

/** @deprecated Use SelfAttendanceListParams or TeamAttendanceListParams */
export type AttendanceListParams = SelfAttendanceListParams;

export type SwapListParams = {
  page?: number;
  pageSize?: number;
  status?: SwapStatus;
  departmentId?: string;
  weekStartDate?: string;
};

export interface AdjustAttendanceRequest {
  clockIn: string;
  clockOut: string;
  adjustmentNote: string;
}

/** Proposed BE endpoint for peer swap targets (Wave 4 §1A). */
export type SwapTargetsParams = {
  fromDate?: string;
  toDate?: string;
};
