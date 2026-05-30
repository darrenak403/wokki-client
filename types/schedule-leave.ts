export interface CreateScheduleLeaveRequest {
  scheduleId: string;
  shiftDefinitionId: string;
  date: string;
  reason: string;
}

export interface ScheduleLeaveRequestResponse {
  id: string;
  scheduleId: string;
  employeeId: string;
  employeeName: string;
  shiftDefinitionId: string;
  shiftName: string;
  date: string;
  reason: string;
  status: string;
  reviewedAt: string | null;
  createdAt: string;
}
