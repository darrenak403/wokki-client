"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCreateDepartmentMutation } from "@/hooks/useDepartments";
import { useCreateLocationMutation } from "@/hooks/useLocations";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resolveOrganizationDisplayName } from "@/lib/support/auth/org-name-storage";
import { writeFoundationSession } from "@/lib/support/foundation/session-context";
import { setBranchIdCookie } from "@/lib/support/routing/branch-cookie";
import { buildBranchScopedPath } from "@/lib/support/routing/tenant-routes";
import { useTenantParams } from "@/hooks/useTenantParams";
import { ROLE_ADMIN } from "@/lib/types/roles";
import { statsKeys } from "@/lib/api/query-keys";
import { useQueryClient } from "@tanstack/react-query";

const locationSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên chi nhánh"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
});

const departmentSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên phòng ban"),
});

type Step = 1 | 2 | "done";

export function OnboardingPanel() {
  const router = useRouter();
  const { orgId } = useTenantParams();
  const queryClient = useQueryClient();
  const { organizationName } = useAuth();
  const orgLabel = resolveOrganizationDisplayName(organizationName);
  const createLocation = useCreateLocationMutation();
  const [locationId, setLocationId] = useState<string | null>(null);
  const createDepartment = useCreateDepartmentMutation(locationId);
  const [step, setStep] = useState<Step>(1);

  const locationForm = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: "Chi nhánh 1", address: "" },
  });

  const departmentForm = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "" },
  });

  const finishOnboarding = async () => {
    await queryClient.invalidateQueries({ queryKey: statsKeys.org() });
    toast.success("Thiết lập tổ chức hoàn tất.");
    if (orgId && locationId) {
      setBranchIdCookie(locationId);
      router.replace(buildBranchScopedPath(orgId, locationId, ROLE_ADMIN, "dashboard"));
    }
  };

  const onLocationSubmit = locationForm.handleSubmit(async (values) => {
    const location = await createLocation.mutateAsync({
      name: values.name,
      address: values.address,
      timeZone: "Asia/Ho_Chi_Minh",
    });
    setLocationId(location.id);
    writeFoundationSession({
      selectedLocationId: location.id,
      selectedDepartmentId: null,
    });
    setStep(2);
  });

  const onDepartmentSubmit = departmentForm.handleSubmit(async (values) => {
    if (!locationId) return;
    const department = await createDepartment.mutateAsync({
      locationId,
      name: values.name,
    });
    writeFoundationSession({
      selectedLocationId: locationId,
      selectedDepartmentId: department.id,
    });
    await finishOnboarding();
  });

  const skipDepartment = async () => {
    await finishOnboarding();
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 py-8">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-brand-blue">Thiết lập ban đầu</p>
        <h1 className="text-2xl font-bold tracking-tight">Chào mừng đến {orgLabel}</h1>
        <p className="text-muted-foreground">
          Tạo chi nhánh và phòng ban đầu tiên để bắt đầu xếp lịch và quản lý nhân sự.
        </p>
      </div>

      <div className="flex justify-center gap-2 text-sm text-muted-foreground">
        <span className={step === 1 ? "font-semibold text-foreground" : ""}>1. Chi nhánh</span>
        <span aria-hidden>→</span>
        <span className={step === 2 ? "font-semibold text-foreground" : ""}>2. Phòng ban</span>
      </div>

      {step === 1 ? (
        <form onSubmit={onLocationSubmit} className="space-y-6" noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="onboard-loc-name">Tên chi nhánh</FieldLabel>
              <Input id="onboard-loc-name" {...locationForm.register("name")} />
              <FieldError errors={[locationForm.formState.errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="onboard-loc-address">Địa chỉ</FieldLabel>
              <Input id="onboard-loc-address" {...locationForm.register("address")} />
              <FieldError errors={[locationForm.formState.errors.address]} />
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={createLocation.isPending}>
            {createLocation.isPending ? "Đang tạo…" : "Tiếp tục"}
          </Button>
        </form>
      ) : null}

      {step === 2 ? (
        <form onSubmit={onDepartmentSubmit} className="space-y-6" noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="onboard-dept-name">Tên phòng ban</FieldLabel>
              <Input id="onboard-dept-name" placeholder="Quầy bar" {...departmentForm.register("name")} />
              <FieldError errors={[departmentForm.formState.errors.name]} />
            </Field>
          </FieldGroup>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => void skipDepartment()}
            >
              Bỏ qua
            </Button>
            <Button type="submit" className="flex-1" disabled={createDepartment.isPending}>
              {createDepartment.isPending ? "Đang tạo…" : "Hoàn tất"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
