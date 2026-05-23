import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchRegister, RegisterRequest, RegisterResponse } from "@/features/waitlist/services/fetchRegister";
import { ApiError } from "@/shared/lib/api/client";
import { QUERY_KEYS } from "@/lib/constants";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, ApiError, RegisterRequest>({
    mutationKey: [QUERY_KEYS.REGISTER],
    mutationFn: fetchRegister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REGISTER] });
    },
    onError: (error) => {
      toast.error(error.message || "Đăng ký thất bại, vui lòng thử lại.");
    },
  });
}
