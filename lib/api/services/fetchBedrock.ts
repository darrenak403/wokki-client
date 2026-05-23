import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type { BedrockHealthResponse } from "@/types/bedrock";

/** Anonymous health check — used to gate AI suggest (no UI). */
export const fetchBedrock = {
  health: async (): Promise<BedrockHealthResponse> => {
    const response = await apiService.get<ApiEnvelope<BedrockHealthResponse>>(
      "api/v1/bedrock/health",
    );
    const envelope = normalizeApiResponse(response.data);
    if (envelope.data) return envelope.data;
    return {
      isConnected: false,
      status: envelope.message.code === "BEDROCK_THROTTLED" ? "Throttled" : "Disconnected",
      modelId: "",
      region: "",
      message: envelope.message.text,
      checkedAtUtc: new Date().toISOString(),
    };
  },
};

export function isBedrockAiAvailable(health: BedrockHealthResponse): boolean {
  return health.isConnected && health.status === "Connected";
}
