import { assertFoundationSuccess } from "@/lib/support/foundation/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  CopyShiftDefinitionsRequest,
  CopyShiftDefinitionsResponse,
  CreateShiftRequest,
  ShiftDefinitionResponse,
  ShiftListParams,
  UpdateShiftRequest,
} from "@/types/foundation";

export const fetchShifts = {
  list: async (params: ShiftListParams): Promise<ShiftDefinitionResponse[]> => {
    const response = await apiService.get<ApiEnvelope<ShiftDefinitionResponse[]>>(
      "api/v1/shifts",
      {
        locationId: params.locationId,
        ...(params.departmentId ? { departmentId: params.departmentId } : {}),
      },
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  create: async (data: CreateShiftRequest): Promise<ShiftDefinitionResponse> => {
    const response = await apiService.post<ApiEnvelope<ShiftDefinitionResponse>>(
      "api/v1/shifts",
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  update: async (id: string, data: UpdateShiftRequest): Promise<ShiftDefinitionResponse> => {
    const response = await apiService.put<ApiEnvelope<ShiftDefinitionResponse>>(
      `api/v1/shifts/${id}`,
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  deactivate: async (id: string): Promise<void> => {
    const response = await apiService.delete<ApiEnvelope<Record<string, never>>>(
      `api/v1/shifts/${id}`,
    );
    assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  copy: async (data: CopyShiftDefinitionsRequest): Promise<CopyShiftDefinitionsResponse> => {
    const response = await apiService.post<ApiEnvelope<CopyShiftDefinitionsResponse>>(
      "api/v1/shifts/copy",
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },
};
