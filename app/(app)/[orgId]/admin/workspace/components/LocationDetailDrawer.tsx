"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SlidersHorizontalIcon } from "lucide-react";
import { LocationManagersSection } from "@/app/(app)/[orgId]/admin/workspace/components/LocationManagersSection";
import { LocationPolicyDialog } from "@/app/(app)/[orgId]/admin/workspace/components/policy/LocationPolicyDialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  useCreateLocationMutation,
  useUpdateLocationMutation,
} from "@/hooks/useLocations";
import { writeFoundationSession } from "@/lib/support/foundation/session-context";
import type { LocationResponse } from "@/types/foundation";

const locationSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  timeZone: z.string().min(1, "Vui lòng nhập múi giờ"),
  isActive: z.boolean(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

type LocationDetailDrawerProps = {
  location: LocationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite?: boolean;
  /** Chỉnh sửa chi nhánh hiện có (tên; các trường khác khi không có canWrite). */
  canEdit?: boolean;
  canAssignManagers?: boolean;
  isCreate?: boolean;
  onSaved?: () => void;
};

export function LocationDetailDrawer({
  location,
  open,
  onOpenChange,
  canWrite = false,
  canEdit = false,
  canAssignManagers = false,
  isCreate = false,
  onSaved,
}: LocationDetailDrawerProps) {
  const createMutation = useCreateLocationMutation();
  const updateMutation = useUpdateLocationMutation();
  const [policyOpen, setPolicyOpen] = useState(false);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: "",
      timeZone: "Asia/Ho_Chi_Minh",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (isCreate || !location) {
      form.reset({
        name: "",
        address: "",
        timeZone: "Asia/Ho_Chi_Minh",
        isActive: true,
      });
      return;
    }
    form.reset({
      name: location.name,
      address: location.address,
      timeZone: location.timeZone,
      isActive: location.isActive,
    });
    writeFoundationSession({
      selectedLocationId: location.id,
      selectedDepartmentId: null,
    });
  }, [open, location, isCreate, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (isCreate || !location) {
      await createMutation.mutateAsync({
        name: values.name,
        address: values.address,
        timeZone: values.timeZone,
      });
    } else if (canWrite) {
      await updateMutation.mutateAsync({ id: location.id, data: values });
    } else {
      await updateMutation.mutateAsync({
        id: location.id,
        data: {
          name: values.name,
          address: location.address,
          timeZone: location.timeZone,
          isActive: location.isActive,
        },
      });
    }
    onSaved?.();
    onOpenChange(false);
  });

  const pending = createMutation.isPending || updateMutation.isPending;
  const canSave = isCreate ? canWrite : canWrite || canEdit;
  const nameReadOnly = !canWrite && !canEdit;
  const detailsReadOnly = !canWrite;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {isCreate ? "Thêm chi nhánh" : location?.name ?? "Chi nhánh"}
            </SheetTitle>
            <SheetDescription>
              {!canSave
                ? "Xem thông tin chi nhánh trong phạm vi quản lý."
                : canWrite
                  ? "Chỉnh sửa chi nhánh, luật xếp lịch và gán Manager."
                  : "Chỉnh sửa tên chi nhánh trong phạm vi quản lý."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={onSubmit} className="flex flex-col gap-6 px-4 pb-4" noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ws-loc-name">Tên</FieldLabel>
                <Input
                  id="ws-loc-name"
                  readOnly={nameReadOnly}
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="ws-loc-address">Địa chỉ</FieldLabel>
                <Input
                  id="ws-loc-address"
                  readOnly={detailsReadOnly}
                  {...form.register("address")}
                />
                <FieldError errors={[form.formState.errors.address]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="ws-loc-tz">Múi giờ</FieldLabel>
                <Input
                  id="ws-loc-tz"
                  readOnly={detailsReadOnly}
                  {...form.register("timeZone")}
                />
                <FieldError errors={[form.formState.errors.timeZone]} />
              </Field>
              {!isCreate && location ? (
                <Field className="flex flex-row items-center justify-between gap-4">
                  <FieldLabel htmlFor="ws-loc-active">Đang hoạt động</FieldLabel>
                  <Switch
                    id="ws-loc-active"
                    disabled={detailsReadOnly}
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                  />
                </Field>
              ) : null}
            </FieldGroup>

            {!isCreate && location && canWrite ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setPolicyOpen(true)}
              >
                <SlidersHorizontalIcon data-icon="inline-start" aria-hidden="true" />
                Luật chi nhánh
              </Button>
            ) : null}

            {!isCreate && location ? (
              <LocationManagersSection
                canAssignManagers={canAssignManagers}
                locationId={location.id}
                locationName={location.name}
              />
            ) : null}

            {canSave ? (
              <SheetFooter className="px-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Đang lưu…" : "Lưu"}
                </Button>
              </SheetFooter>
            ) : null}
          </form>
        </SheetContent>
      </Sheet>

      {location && !isCreate ? (
        <LocationPolicyDialog
          key={location.id}
          location={location}
          open={policyOpen}
          onOpenChange={setPolicyOpen}
          canWrite={canWrite}
        />
      ) : null}
    </>
  );
}
