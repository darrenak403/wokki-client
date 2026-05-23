export type BedrockConnectionStatus = "Connected" | "Disconnected" | "Throttled";

export interface BedrockHealthResponse {
  isConnected: boolean;
  status: BedrockConnectionStatus;
  modelId: string;
  region: string;
  message?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  checkedAtUtc: string;
}
