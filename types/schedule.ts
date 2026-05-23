import type { PagedResponse } from "@/types/foundation";

/** BE ScheduleStatus — 0 Draft, 1 Published, 2 Locked (no API to Locked in MVP). */
export type ScheduleStatus = 0 | 1 | 2;

export const SCHEDULE_STATUS = {
  Draft: 0,
  Published: 1,
  Locked: 2,
} as const satisfies Record<string, ScheduleStatus>;

export interface ScheduleResponse {
  id: string;
  departmentId: string;
  weekStartDate: string;
  status: ScheduleStatus;
  createdBy: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface ShiftAssignmentResponse {
  id: string;
  scheduleId: string;
  shiftDefinitionId: string;
  shiftName: string;
  shiftColor?: string | null;
  startTime: string;
  endTime: string;
  employeeId: string;
  date: string;
  departmentId?: string | null;
  departmentName?: string | null;
  locationId?: string | null;
  locationName?: string | null;
  note: string | null;
  createdAt: string;
}

export interface ScheduleDetailResponse {
  schedule: ScheduleResponse;
  assignments: ShiftAssignmentResponse[];
}

export interface ScheduleSuggestion {
  id: string;
  shiftDefinitionId: string;
  shiftName: string;
  employeeId: string;
  employeeName: string;
  date: string;
  score: number;
}

export type SuggestScheduleProvider = "heuristic" | "bedrock";

export interface SuggestScheduleRequest {
  useAi?: boolean;
}

export interface SuggestScheduleResponse {
  suggestions: ScheduleSuggestion[];
  reason: string | null;
  provider: SuggestScheduleProvider;
  fallbackUsed: boolean;
}

export interface CreateScheduleRequest {
  departmentId: string;
  weekStartDate: string;
}

export interface UpdateScheduleRequest {
  departmentId: string;
  weekStartDate: string;
}

export interface CreateAssignmentRequest {
  shiftDefinitionId: string;
  employeeId: string;
  date: string;
  note?: string | null;
}

export interface ApplySuggestionItem {
  shiftDefinitionId: string;
  employeeId: string;
  date: string;
  note?: string | null;
}

export interface ApplySuggestionsRequest {
  suggestions: ApplySuggestionItem[];
}

export interface CopyScheduleRequest {
  targetWeekStartDate: string;
}

export type ScheduleListParams = {
  page?: number;
  pageSize?: number;
  departmentId?: string;
  weekStartDate?: string;
};

export type { PagedResponse };
