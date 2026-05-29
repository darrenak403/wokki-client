"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { foundationKeys, membershipKeys } from "@/lib/api/query-keys";
import { fetchDepartmentMembership } from "@/lib/api/services/fetchDepartmentMembership";
import { fetchLocationMembership } from "@/lib/api/services/fetchLocationMembership";
import { mapMembershipError } from "@/lib/support/membership/map-errors";
import type {
  TransferDepartmentRequest,
  TransferLocationRequest,
} from "@/types/location-membership";

export function useTransferLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransferLocationRequest) => fetchLocationMembership.transferLocation(data),
    onSuccess: (membership, variables) => {
      void queryClient.invalidateQueries({ queryKey: membershipKeys.all });
      void queryClient.invalidateQueries({ queryKey: [...foundationKeys.all, "employees"] });
      void queryClient.invalidateQueries({
        queryKey: foundationKeys.employee(variables.employeeId),
      });
      void queryClient.invalidateQueries({
        queryKey: membershipKeys.byLocation(membership.locationId, null),
      });
      toast.success("Đã chuyển nhân viên sang chi nhánh mới.");
    },
    onError: (error) => toast.error(mapMembershipError(error)),
  });
}

export function useTransferDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransferDepartmentRequest) =>
      fetchDepartmentMembership.transferDepartment(data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: [...foundationKeys.all, "employees"] });
      void queryClient.invalidateQueries({
        queryKey: foundationKeys.employee(variables.employeeId),
      });
      void queryClient.invalidateQueries({ queryKey: foundationKeys.all });
      toast.success("Đã phân nhân viên vào phòng ban.");
    },
    onError: (error) => toast.error(mapMembershipError(error)),
  });
}
