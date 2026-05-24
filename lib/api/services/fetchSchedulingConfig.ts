import { assertSchedulingConfigSuccess } from "@/lib/support/scheduling-config/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  CreateJobPositionRequest,
  JobPositionResponse,
  UpdateJobPositionRequest,
} from "@/types/scheduling-config";

export const fetchSchedulingConfig = {
  listJobPositions: async (departmentId: string): Promise<JobPositionResponse[]> => {
    const response = await apiService.get<ApiEnvelope<JobPositionResponse[]>>(
      `api/v1/departments/${departmentId}/job-positions`,
    );
    return assertSchedulingConfigSuccess(normalizeApiResponse(response.data));
  },

  createJobPosition: async (
    departmentId: string,
    data: CreateJobPositionRequest,
  ): Promise<JobPositionResponse> => {
    const response = await apiService.post<ApiEnvelope<JobPositionResponse>>(
      `api/v1/departments/${departmentId}/job-positions`,
      data,
    );
    return assertSchedulingConfigSuccess(normalizeApiResponse(response.data));
  },

  updateJobPosition: async (
    departmentId: string,
    jobPositionId: string,
    data: UpdateJobPositionRequest,
  ): Promise<JobPositionResponse> => {
    const response = await apiService.put<ApiEnvelope<JobPositionResponse>>(
      `api/v1/departments/${departmentId}/job-positions/${jobPositionId}`,
      data,
    );
    return assertSchedulingConfigSuccess(normalizeApiResponse(response.data));
  },

  deleteJobPosition: async (departmentId: string, jobPositionId: string): Promise<void> => {
    const response = await apiService.delete<ApiEnvelope<unknown>>(
      `api/v1/departments/${departmentId}/job-positions/${jobPositionId}`,
    );
    assertSchedulingConfigSuccess(normalizeApiResponse(response.data));
  },
};
