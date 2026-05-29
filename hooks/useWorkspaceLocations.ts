"use client";

import { useLocationsQuery } from "@/hooks/useLocations";
import { useMyManagedLocationsQuery } from "@/hooks/useLocationManagers";

/** Admin: all locations. Manager: assigned branches only. */
export function useWorkspaceLocations(isManagerScope: boolean) {
  const adminQuery = useLocationsQuery({ enabled: !isManagerScope });
  const managerQuery = useMyManagedLocationsQuery({ enabled: isManagerScope });

  if (isManagerScope) {
    return {
      data: managerQuery.data ?? [],
      isLoading: managerQuery.isLoading,
      isError: managerQuery.isError,
      error: managerQuery.error,
      refetch: managerQuery.refetch,
    };
  }

  return {
    data: adminQuery.data ?? [],
    isLoading: adminQuery.isLoading,
    isError: adminQuery.isError,
    error: adminQuery.error,
    refetch: adminQuery.refetch,
  };
}
