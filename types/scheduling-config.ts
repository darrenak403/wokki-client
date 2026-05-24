export interface JobPositionResponse {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  targetHeadcount: number;
  isActive: boolean;
}

export interface CreateJobPositionRequest {
  name: string;
  code: string;
  targetHeadcount: number;
}

export interface UpdateJobPositionRequest {
  name: string;
  code: string;
  targetHeadcount: number;
  isActive: boolean;
}
