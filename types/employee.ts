import type { ShiftAssignmentResponse } from "@/types/schedule";

export type { ShiftAssignmentResponse };

export const SWAP_POST_STATUS = {
  Pending: 0,
  Completed: 1,
  Hidden: 2,
  Cancelled: 3,
  Expired: 4,
} as const;

export const SWAP_POST_TYPE = {
  Cover: 0,
  CrossSwap: 1,
} as const;

export type SwapPostStatus = (typeof SWAP_POST_STATUS)[keyof typeof SWAP_POST_STATUS];
export type SwapPostType = (typeof SWAP_POST_TYPE)[keyof typeof SWAP_POST_TYPE];

export interface SwapPostAuthorDto {
  employeeId: string;
  displayName: string;
}

export interface SwapPostShiftDto {
  assignmentId: string;
  date: string;
  shiftDefinitionId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
}

export interface SwapPostResponse {
  id: string;
  scheduleId: string;
  type: SwapPostType;
  status: SwapPostStatus;
  author: SwapPostAuthorDto;
  offeredShift: SwapPostShiftDto;
  acceptedShift: SwapPostShiftDto | null;
  acceptedBy: SwapPostAuthorDto | null;
  note: string | null;
  createdAt: string;
  completedAt: string | null;
  canAccept: boolean;
  canCancel: boolean;
  isMine: boolean;
}

export interface SwapPostAuditResponse {
  id: string;
  type: SwapPostType;
  completedAt: string;
  author: SwapPostAuthorDto;
  acceptedBy: SwapPostAuthorDto | null;
  offeredShift: SwapPostShiftDto;
  acceptedShift: SwapPostShiftDto | null;
  scheduleId: string;
  locationId: string;
  departmentId: string;
}

export interface CreateSwapPostRequest {
  authorAssignmentId: string;
  type: SwapPostType;
  note?: string | null;
}

export interface AcceptSwapPostRequest {
  acceptorAssignmentId?: string | null;
}

export interface SwapPostListParams {
  page?: number;
  pageSize?: number;
  scheduleId?: string;
  status?: SwapPostStatus;
  locationId?: string;
  weekStartDate?: string;
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
  autoClosed?: boolean;
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

export interface AdjustAttendanceRequest {
  clockIn: string;
  clockOut: string;
  adjustmentNote: string;
}
