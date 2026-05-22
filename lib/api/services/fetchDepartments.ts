import { assertFoundationSuccess } from "@/lib/support/foundation/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  CreateDepartmentRequest,
  DepartmentResponse,
  UpdateDepartmentRequest,
} from "@/types/foundation";

export const fetchDepartments = {
  list: async (locationId?: string): Promise<DepartmentResponse[]> => {
    const response = await apiService.get<ApiEnvelope<DepartmentResponse[]>>(
      "api/v1/departments",
      locationId ? { locationId } : undefined,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  create: async (data: CreateDepartmentRequest): Promise<DepartmentResponse> => {
    const response = await apiService.post<ApiEnvelope<DepartmentResponse>>(
      "api/v1/departments",
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  update: async (id: string, data: UpdateDepartmentRequest): Promise<DepartmentResponse> => {
    const response = await apiService.put<ApiEnvelope<DepartmentResponse>>(
      `api/v1/departments/${id}`,
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },
};
