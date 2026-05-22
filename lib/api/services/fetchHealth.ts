import type { ApiEnvelope } from "@/types/api";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "../core";

export type HealthData = { status: string };

export async function fetchHealth() {
  const response = await apiService.get<ApiEnvelope<HealthData>>("health");
  return normalizeApiResponse(response.data);
}
