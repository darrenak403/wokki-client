export interface RosterAssignmentResponse {
  id: string;
  scheduleId: string;
  scheduleStatus: string;
  weekStartDate: string;
  shiftDefinitionId: string;
  shiftName: string;
  shiftColor: string;
  startTime: string;
  endTime: string;
  employeeId: string;
  employeeFirstName: string;
  employeeLastName: string;
  date: string;
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  note: string | null;
  createdAt: string;
}

export type ScheduleRosterParams = {
  weekStartDate: string;
  weekEndDate?: string;
  departmentId?: string;
  employeeId?: string;
};
