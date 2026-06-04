"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchEmployees } from "@/lib/api/services/fetchEmployees";
import { foundationKeys, managerKeys, membershipKeys } from "@/lib/api/query-keys";
import { mapMembershipError } from "@/lib/support/membership/map-errors";
import type { EmployeeRoleTransitionRequest } from "@/types/foundation";

export function useEmployeeRoleTransitionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      data,
    }: {
      employeeId: string;
      data: EmployeeRoleTransitionRequest;
    }) => fetchEmployees.roleTransition(employeeId, data),
    onSuccess: (employee) => {
      void queryClient.invalidateQueries({ queryKey: foundationKeys.all });
      void queryClient.invalidateQueries({ queryKey: managerKeys.all });
      void queryClient.invalidateQueries({ queryKey: membershipKeys.all });
      void queryClient.invalidateQueries({
        queryKey: foundationKeys.employee(employee.id),
      });
      toast.success("Đã cập nhật vai trò. Nhân viên cần đăng nhập lại để áp dụng quyền mới.");
    },
    onError: (error) => toast.error(mapMembershipError(error)),
  });
}
