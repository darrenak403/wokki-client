import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/lib/api/services/fetchStats";
import { statsKeys } from "@/lib/api/query-keys";

export function usePlatformStatsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: statsKeys.platform(),
    queryFn: () => fetchStats.platform(),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  });
}
