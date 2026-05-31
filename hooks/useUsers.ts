"use client";

import { useQuery } from "@tanstack/react-query";
import { foundationKeys } from "@/lib/api/query-keys";
import { fetchUsers } from "@/lib/api/services/fetchUsers";
import type { UserListParams } from "@/types/foundation";

export function useUsersQuery(params: UserListParams) {
  return useQuery({
    queryKey: foundationKeys.users(params),
    queryFn: () => fetchUsers.list(params),
    staleTime: 60 * 1000,
  });
}
