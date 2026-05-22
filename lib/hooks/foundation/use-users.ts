"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { foundationKeys } from "@/lib/api/query-keys";
import { fetchUsers } from "@/lib/api/services/fetchUsers";
import { mapFoundationError } from "@/lib/auth/map-foundation-error";
import type { CreateUserRequest, UserListParams } from "@/types/foundation";

export function useUsersQuery(params: UserListParams) {
  return useQuery({
    queryKey: foundationKeys.users(params),
    queryFn: () => fetchUsers.list(params),
    staleTime: 60 * 1000,
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => fetchUsers.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...foundationKeys.all, "users"] });
      toast.success("Đã tạo tài khoản hệ thống.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}
