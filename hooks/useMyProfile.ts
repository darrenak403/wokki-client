import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSelf } from "@/lib/api/services/fetchSelf";
import { employeeKeys } from "@/lib/api/query-keys";
import type { UpdateMyProfileRequest } from "@/types/foundation";
import type { ApiError } from "@/types/api";

function isNoEmployeeError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "messageCode" in error &&
    (error as ApiError).messageCode === "SELF_NO_EMPLOYEE"
  );
}

export function useMyProfileQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: employeeKeys.myProfile(),
    queryFn: () => fetchSelf.getProfile(),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
    retry: (count, error) => !isNoEmployeeError(error) && count < 1,
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMyProfileRequest) => fetchSelf.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(employeeKeys.myProfile(), data);
    },
  });
}

export { isNoEmployeeError };
