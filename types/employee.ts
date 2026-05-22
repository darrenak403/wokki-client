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
  targetShiftDate: string;
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

export interface AttendanceResponse {
  id: string;
  employeeId: string;
  assignmentId: string;
  clockIn: string;
  clockOut: string | null;
  workedMinutes: number;
  adjustedBy: string | null;
  adjustmentNote: string | null;
  createdAt: string;
}

export interface ClockInRequest {
  assignmentId?: string;
}

export type AttendanceListParams = {
  fromDate?: string;
  toDate?: string;
};

/** Proposed BE endpoint for peer swap targets (Wave 4 §1A). */
export type SwapTargetsParams = {
  fromDate?: string;
  toDate?: string;
};
