import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/lib/api/services/fetchStats";
import { statsKeys } from "@/lib/api/query-keys";

export function useOrgStatsQuery(options?: { enabled?: boolean; retry?: boolean | number }) {
  return useQuery({
    queryKey: statsKeys.org(),
    queryFn: () => fetchStats.org(),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
    retry: options?.retry ?? 1,
  });
}
