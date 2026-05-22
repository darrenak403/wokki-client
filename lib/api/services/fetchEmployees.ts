import { assertFoundationSuccess } from "@/lib/support/foundation/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  EmployeeListParams,
  EmployeeResponse,
  PagedResponse,
  UpdateEmployeeRequest,
} from "@/types/foundation";

export const fetchEmployees = {
  list: async (params: EmployeeListParams = {}): Promise<PagedResponse<EmployeeResponse>> => {
    const response = await apiService.get<ApiEnvelope<PagedResponse<EmployeeResponse>>>(
      "api/v1/employees",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        ...(params.departmentId ? { departmentId: params.departmentId } : {}),
        ...(params.locationId ? { locationId: params.locationId } : {}),
        ...(params.includeTerminated ? { includeTerminated: true } : {}),
      },
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  getById: async (id: string): Promise<EmployeeResponse> => {
    const response = await apiService.get<ApiEnvelope<EmployeeResponse>>(
      `api/v1/employees/${id}`,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  create: async (data: CreateEmployeeRequest): Promise<CreateEmployeeResponse> => {
    const response = await apiService.post<ApiEnvelope<CreateEmployeeResponse>>(
      "api/v1/employees",
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  update: async (id: string, data: UpdateEmployeeRequest): Promise<EmployeeResponse> => {
    const response = await apiService.put<ApiEnvelope<EmployeeResponse>>(
      `api/v1/employees/${id}`,
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  terminate: async (id: string): Promise<void> => {
    const response = await apiService.delete<ApiEnvelope<Record<string, never>>>(
      `api/v1/employees/${id}`,
    );
    assertFoundationSuccess(normalizeApiResponse(response.data));
  },
};
