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

export interface ScheduleRebalanceConflict {
  assignmentId: string;
  employeeId: string;
  employeeName: string;
  shiftDefinitionId: string;
  shiftName: string;
  date: string;
}

export interface ScheduleRebalanceHints {
  hasRecentPreferenceChanges: boolean;
  conflictCount: number;
  pendingLeaveCount: number;
  conflicts: ScheduleRebalanceConflict[];
}

export const EMPTY_REBALANCE_HINTS: ScheduleRebalanceHints = {
  hasRecentPreferenceChanges: false,
  conflictCount: 0,
  pendingLeaveCount: 0,
  conflicts: [],
};

export interface ScheduleDetailResponse {
  schedule: ScheduleResponse;
  assignments: ShiftAssignmentResponse[];
  rebalanceHints: ScheduleRebalanceHints;
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

export type SuggestScheduleProvider = "heuristic" | "cp-sat";

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
  /** Xóa phân ca cũ ở các ô không có trong gợi ý (gợi ý lại / đè lịch). */
  clearOrphanAssignments?: boolean;
}

export interface ScheduleInsightSuggestionInput {
  shiftDefinitionId: string;
  employeeId: string;
  date: string;
  score: number;
  explanations?: string[] | null;
  warnings?: string[] | null;
}

export interface GenerateScheduleInsightContextRequest {
  suggestions?: ScheduleInsightSuggestionInput[] | null;
  provider?: string;
  fallbackUsed?: boolean;
  solveStatus?: string | null;
  solveDurationMs?: number | null;
  warnings?: string[] | null;
}

export interface ScheduleInsightContextResponse {
  scheduleId: string;
  locationId: string;
  departmentId: string;
  weekStartDate: string;
  schemaVersion: string;
  provider: string;
  fallbackUsed: boolean;
  generatedAt: string;
  updatedAt: string;
  expiresAt: string;
  jsonContent: string;
}

export interface ScheduleInsightChatRequest {
  question: string;
}

export interface ScheduleInsightChatResponse {
  scheduleId: string;
  answer: string;
  provider: string;
  contextGeneratedAt: string;
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
