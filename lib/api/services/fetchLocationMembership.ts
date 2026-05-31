import apiService from "@/lib/api/core";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import { assertMembershipSuccess } from "@/lib/support/membership/assert-success";
import { mapMembershipResponseFailure } from "@/lib/support/membership/map-errors";
import { normalizeMembershipStatus } from "@/lib/support/membership/status";
import type { ApiEnvelope, ApiError } from "@/types/api";
import type {
  LocationMembershipResponse,
  LocationMembershipStatus,
  TransferLocationRequest,
} from "@/types/location-membership";

type LocationMembershipWireResponse = Omit<LocationMembershipResponse, "status"> & {
  status: LocationMembershipStatus | number | string;
};

function normalizeMembership(
  row: LocationMembershipWireResponse | null
): LocationMembershipResponse | null {
  if (!row) return null;
  return { ...row, status: normalizeMembershipStatus(row.status) };
}

function normalizeMembershipList(
  rows: LocationMembershipWireResponse[]
): LocationMembershipResponse[] {
  return rows.map((row) => normalizeMembership(row)!);
}

function throwApiError(normalized: ReturnType<typeof normalizeApiResponse>): never {
  const err = Object.assign(new Error(mapMembershipResponseFailure(normalized)), {
    httpStatus: normalized.message?.statusCode ?? 500,
    status: false as const,
    messageCode: normalized.message?.code,
  } satisfies Partial<ApiError>);
  throw err;
}

export const fetchLocationMembership = {
  getMy: async (): Promise<LocationMembershipResponse | null> => {
    const response = await apiService.get<ApiEnvelope<LocationMembershipWireResponse | null>>(
      "api/v1/location-memberships/my"
    );
    const normalized = normalizeApiResponse(response.data);
    if (!normalized.success) throwApiError(normalized);
    return normalizeMembership(normalized.data);
  },

  listByLocation: async (
    locationId: string,
    status?: LocationMembershipStatus
  ): Promise<LocationMembershipResponse[]> => {
    const response = await apiService.get<ApiEnvelope<LocationMembershipWireResponse[]>>(
      `api/v1/locations/${locationId}/memberships`,
      status ? { status } : undefined
    );
    return normalizeMembershipList(assertMembershipSuccess(normalizeApiResponse(response.data)));
  },

  transferLocation: async (data: TransferLocationRequest): Promise<LocationMembershipResponse> => {
    const response = await apiService.post<ApiEnvelope<LocationMembershipWireResponse>>(
      "api/v1/location-memberships/transfer",
      data
    );
    return normalizeMembership(assertMembershipSuccess(normalizeApiResponse(response.data)))!;
  },
};
