"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PencilIcon, PlusIcon, SlidersHorizontalIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateLocationMutation,
  useLocationSchedulingPolicyQuery,
  useLocationsQuery,
  useUpdateLocationMutation,
  useUpdateLocationSchedulingPolicyMutation,
} from "@/hooks/useLocations";
import type {
  LocationSchedulingRule,
  LocationResponse,
} from "@/types/foundation";

const locationSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  timeZone: z.string().min(1, "Vui lòng nhập múi giờ"),
  isActive: z.boolean(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

type LocationsPanelProps = {
  canWrite?: boolean;
};

export function LocationsPanel({ canWrite = false }: LocationsPanelProps) {
  const { data: locations = [], isLoading, isError } = useLocationsQuery();
  const createMutation = useCreateLocationMutation();
  const updateMutation = useUpdateLocationMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocationResponse | null>(null);
  const [policyLocation, setPolicyLocation] = useState<LocationResponse | null>(null);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: "",
      timeZone: "Asia/Ho_Chi_Minh",
      isActive: true,
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      address: "",
      timeZone: "Asia/Ho_Chi_Minh",
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (row: LocationResponse) => {
    setEditing(row);
    form.reset({
      name: row.name,
      address: row.address,
      timeZone: row.timeZone,
      isActive: row.isActive,
    });
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        address: values.address,
        timeZone: values.timeZone,
      });
    }
    setOpen(false);
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-end gap-4">
        {canWrite ? (
          <Button type="button" onClick={openCreate}>
            <PlusIcon className="size-4" />
            Thêm chi nhánh
          </Button>
        ) : null}
      </div>

      {isError ? (
        <p className="text-sm text-destructive">Không tải được danh sách chi nhánh.</p>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Múi giờ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[220px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Đang tải…
              </TableCell>
            </TableRow>
          ) : locations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Chưa có chi nhánh.
                {canWrite ? " Tạo chi nhánh đầu tiên." : ""}
              </TableCell>
            </TableRow>
          ) : (
            locations.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.timeZone}</TableCell>
                <TableCell>
                  {row.isActive ? (
                    <Badge variant="secondary">Hoạt động</Badge>
                  ) : (
                    <Badge variant="outline">Ngưng hoạt động</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPolicyLocation(row)}
                    >
                      <SlidersHorizontalIcon className="size-4" />
                      Luật chi nhánh
                    </Button>
                    {canWrite ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row)}>
                      <PencilIcon className="size-4" />
                      Sửa
                    </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa chi nhánh" : "Thêm chi nhánh"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="loc-name">Tên</FieldLabel>
                <Input id="loc-name" {...form.register("name")} />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="loc-address">Địa chỉ</FieldLabel>
                <Input id="loc-address" {...form.register("address")} />
                <FieldError errors={[form.formState.errors.address]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="loc-tz">Múi giờ</FieldLabel>
                <Input id="loc-tz" {...form.register("timeZone")} />
                <FieldError errors={[form.formState.errors.timeZone]} />
              </Field>
              {editing ? (
                <Field className="flex flex-row items-center justify-between gap-4">
                  <FieldLabel htmlFor="loc-active">Đang hoạt động</FieldLabel>
                  <Switch
                    id="loc-active"
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                  />
                </Field>
              ) : null}
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Đang lưu…" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LocationPolicyDialog
        location={policyLocation}
        open={Boolean(policyLocation)}
        onOpenChange={(next) => {
          if (!next) setPolicyLocation(null);
        }}
        canWrite={canWrite}
      />
    </div>
  );
}

function LocationPolicyDialog({
  location,
  open,
  onOpenChange,
  canWrite,
}: {
  location: LocationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
}) {
  const locationId = location?.id ?? null;
  const { data: policy, isLoading } = useLocationSchedulingPolicyQuery(locationId, open);
  const updatePolicy = useUpdateLocationSchedulingPolicyMutation(locationId ?? "");
  const [rules, setRules] = useState<LocationSchedulingRule[]>([]);

  useEffect(() => {
    setRules(policy?.rules ?? []);
  }, [policy]);

  const updateRule = (
    index: number,
    patch: Partial<LocationSchedulingRule>,
  ) => {
    setRules((current) =>
      current.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, ...patch } : rule)),
    );
  };

  const removeRule = (index: number) => {
    setRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
  };

  const addRule = () => {
    setRules((current) => [
      ...current,
      {
        key: `custom_${Date.now()}`,
        category: "customRules",
        content: "",
        inputLabel: "",
        valueType: "text",
        value: "",
        enabled: true,
        isDefault: false,
        isRequired: false,
        sortOrder: 10000 + current.length,
      },
    ]);
  };

  const saveRules = async () => {
    if (!locationId || !canWrite) return;
    await updatePolicy.mutateAsync({
      schemaVersion: policy?.schemaVersion,
      rules: rules.map((rule, index) => ({
        ...rule,
        sortOrder: rule.sortOrder || index + 1,
        content: rule.content.trim(),
        inputLabel: rule.inputLabel.trim(),
        value: normalizeRuleValue(rule.value, rule.valueType),
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Luật chi nhánh — {location?.name ?? ""}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải luật chi nhánh…</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Bên trái là nội dung luật, bên phải là giá trị cần điền. Chi nhánh có thể xoá luật không dùng hoặc thêm luật riêng dạng typed config.
              </p>
              {canWrite ? (
                <Button type="button" variant="outline" onClick={addRule}>
                  <PlusIcon className="size-4" />
                  Thêm luật
                </Button>
              ) : null}
            </div>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[52%]">Nội dung luật</TableHead>
                    <TableHead>Nội dung cần điền</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground">
                        Chưa có luật cho chi nhánh này.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rules.map((rule, index) => (
                      <TableRow key={`${rule.key}-${index}`}>
                        <TableCell className="align-top">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{rule.category}</Badge>
                              {rule.isRequired ? <Badge variant="secondary">Bắt buộc</Badge> : null}
                              <Switch
                                checked={rule.enabled}
                                disabled={!canWrite}
                                onCheckedChange={(enabled) => updateRule(index, { enabled })}
                                aria-label="Bật tắt luật"
                              />
                            </div>
                            <Input
                              value={rule.content}
                              disabled={!canWrite || rule.isDefault}
                              onChange={(event) => updateRule(index, { content: event.target.value })}
                              placeholder="Mô tả luật"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-2">
                            <Input
                              value={rule.inputLabel}
                              disabled={!canWrite || rule.isDefault}
                              onChange={(event) => updateRule(index, { inputLabel: event.target.value })}
                              placeholder="Tên trường cần điền"
                            />
                            <RuleValueInput
                              rule={rule}
                              disabled={!canWrite || !rule.enabled}
                              onChange={(value) => updateRule(index, { value })}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          {canWrite && !rule.isRequired ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeRule(index)}
                              aria-label="Xóa luật"
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
              {canWrite ? (
                <Button type="button" disabled={updatePolicy.isPending} onClick={() => void saveRules()}>
                  {updatePolicy.isPending ? "Đang lưu…" : "Lưu luật"}
                </Button>
              ) : null}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RuleValueInput({
  rule,
  disabled,
  onChange,
}: {
  rule: LocationSchedulingRule;
  disabled: boolean;
  onChange: (value: LocationSchedulingRule["value"]) => void;
}) {
  if (rule.valueType === "boolean") {
    return (
      <div className="flex min-h-10 items-center justify-between rounded-md border px-3">
        <span className="text-sm text-muted-foreground">{rule.inputLabel || "Giá trị"}</span>
        <Switch checked={Boolean(rule.value)} disabled={disabled} onCheckedChange={onChange} />
      </div>
    );
  }

  return (
    <Input
      type={rule.valueType === "number" ? "number" : "text"}
      value={rule.value === null ? "" : String(rule.value)}
      disabled={disabled}
      onChange={(event) => onChange(rule.valueType === "number" ? Number(event.target.value) : event.target.value)}
      placeholder={rule.inputLabel || "Giá trị"}
    />
  );
}

function normalizeRuleValue(
  value: LocationSchedulingRule["value"],
  valueType: LocationSchedulingRule["valueType"],
) {
  if (valueType === "number") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  if (valueType === "boolean") return Boolean(value);

  return value === null ? "" : String(value);
}
