import { assertFoundationSuccess } from "@/lib/support/foundation/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  OrganizationSchedulingPolicyResponse,
  SchedulingRuleCatalogResponse,
  UpsertOrganizationSchedulingPolicyRequest,
} from "@/types/foundation";

export const fetchOrgSchedulingPolicy = {
  getCatalog: async (): Promise<SchedulingRuleCatalogResponse> => {
    const response = await apiService.get<ApiEnvelope<SchedulingRuleCatalogResponse>>(
      "api/v1/scheduling/rule-catalog",
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  getPolicy: async (): Promise<OrganizationSchedulingPolicyResponse> => {
    const response = await apiService.get<ApiEnvelope<OrganizationSchedulingPolicyResponse>>(
      "api/v1/org/scheduling-policy",
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },

  updatePolicy: async (
    data: UpsertOrganizationSchedulingPolicyRequest,
  ): Promise<OrganizationSchedulingPolicyResponse> => {
    const response = await apiService.put<ApiEnvelope<OrganizationSchedulingPolicyResponse>>(
      "api/v1/org/scheduling-policy",
      data,
    );
    return assertFoundationSuccess(normalizeApiResponse(response.data));
  },
};
