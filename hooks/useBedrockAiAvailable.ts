"use client";

import { useQuery } from "@tanstack/react-query";
import { bedrockKeys } from "@/lib/api/query-keys";
import { fetchBedrock, isBedrockAiAvailable } from "@/lib/api/services/fetchBedrock";

/** Silent Bedrock health — gates AI toggle (no ops UI). */
export function useBedrockAiAvailable(enabled = true) {
  const query = useQuery({
    queryKey: bedrockKeys.health(),
    queryFn: () => fetchBedrock.health(),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    aiAvailable: query.data ? isBedrockAiAvailable(query.data) : false,
  };
}
