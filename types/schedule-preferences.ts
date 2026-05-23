export type PreferenceType = "Preferred" | "Available" | "Unavailable";

export type SchedulePreferenceStatus = "Draft" | "Submitted" | "Withdrawn";

export interface SchedulePreferenceLine {
  shiftDefinitionId: string;
  date: string;
  preferenceType: PreferenceType;
}

export interface MySchedulePreferenceResponse {
  scheduleId: string;
  submissionId: string | null;
  status: SchedulePreferenceStatus;
  lines: SchedulePreferenceLine[];
}

export interface SaveSchedulePreferencesRequest {
  lines: SchedulePreferenceLine[];
}

export interface SchedulePreferenceCell {
  shiftDefinitionId: string;
  date: string;
  preferenceType: PreferenceType | null;
}

export interface SchedulePreferenceBoardEmployee {
  employeeId: string;
  employeeName: string;
  position: string;
  jobPositionId: string | null;
  status: SchedulePreferenceStatus | null;
  cells: SchedulePreferenceCell[];
}

export interface SchedulePreferenceBoardShift {
  shiftDefinitionId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  maxStaffPerSlot: number;
}

export interface SchedulePreferenceBoardResponse {
  scheduleId: string;
  weekStartDate: string;
  employeeCount: number;
  submittedCount: number;
  employees: SchedulePreferenceBoardEmployee[];
  shifts: SchedulePreferenceBoardShift[];
}

export interface EmployeeDraftScheduleResponse {
  scheduleId: string;
  weekStartDate: string;
  shifts: SchedulePreferenceBoardShift[];
}
