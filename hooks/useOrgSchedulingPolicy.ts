"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { foundationKeys } from "@/lib/api/query-keys";
import { fetchOrgSchedulingPolicy } from "@/lib/api/services/fetchOrgSchedulingPolicy";
import { mapFoundationError } from "@/lib/support/foundation/map-errors";
import type { UpsertOrganizationSchedulingPolicyRequest, SchedulingPolicyWizardRequest } from "@/types/foundation";

const STALE_MS = 5 * 60 * 1000;

export function useSchedulingRuleCatalogQuery(enabled = true) {
  return useQuery({
    queryKey: foundationKeys.schedulingCatalog(),
    queryFn: () => fetchOrgSchedulingPolicy.getCatalog(),
    staleTime: STALE_MS,
    enabled,
  });
}

export function useOrgSchedulingPolicyQuery(enabled = true) {
  return useQuery({
    queryKey: foundationKeys.orgSchedulingPolicy(),
    queryFn: () => fetchOrgSchedulingPolicy.getPolicy(),
    staleTime: STALE_MS,
    enabled,
  });
}

export function useUpdateOrgSchedulingPolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertOrganizationSchedulingPolicyRequest) =>
      fetchOrgSchedulingPolicy.updatePolicy(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foundationKeys.orgSchedulingPolicy() });
      toast.success("Đã lưu luật xếp lịch tổ chức.");
    },
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}

export function useSchedulingPolicyWizardDraftMutation() {
  return useMutation({
    mutationFn: (data: SchedulingPolicyWizardRequest) =>
      fetchOrgSchedulingPolicy.buildWizardDraft(data),
    onError: (error) => toast.error(mapFoundationError(error)),
  });
}
