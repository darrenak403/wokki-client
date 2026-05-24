"use client";

import { useMemo, useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useLocationSchedulingPolicyQuery,
  useUpdateLocationSchedulingPolicyMutation,
} from "@/hooks/useLocations";
import {
  BRANCH_RULE_SECTIONS,
  CUSTOM_RULES_SECTION,
  createCustomRule,
  getCustomRules,
  patchRule,
  patchRuleValue,
  prepareRulesForSave,
  removeRule,
  VALUE_TYPE_LABELS,
} from "@/lib/support/schedule/location-scheduling-rules";
import type { LocationResponse, LocationSchedulingRule } from "@/types/foundation";

type LocationPolicyDialogProps = {
  location: LocationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
};

export function LocationPolicyDialog({
  location,
  open,
  onOpenChange,
  canWrite,
}: LocationPolicyDialogProps) {
  const locationId = location?.id ?? null;
  const { data: policy, isLoading } = useLocationSchedulingPolicyQuery(locationId, open);
  const updatePolicy = useUpdateLocationSchedulingPolicyMutation(locationId ?? "");
  const serverRules = policy?.rules ?? [];
  const [editedRules, setEditedRules] = useState<LocationSchedulingRule[] | null>(null);
  const rules = editedRules ?? serverRules;

  const rulesMap = useMemo(
    () => new Map(rules.map((rule) => [rule.key, rule])),
    [rules],
  );
  const customRules = useMemo(() => getCustomRules(rules), [rules]);

  const mutateRules = (
    updater: (current: LocationSchedulingRule[]) => LocationSchedulingRule[],
  ) => {
    setEditedRules((current) => updater(current ?? serverRules));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setEditedRules(null);
    onOpenChange(next);
  };

  const saveRules = async () => {
    if (!locationId || !canWrite) return;
    await updatePolicy.mutateAsync({
      schemaVersion: policy?.schemaVersion,
      rules: prepareRulesForSave(rules),
    });
    setEditedRules(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <DialogHeader className="space-y-2 border-b px-6 py-5">
          <DialogTitle>Luật chi nhánh</DialogTitle>
          {location ? (
            <p className="text-sm font-medium text-foreground">{location.name}</p>
          ) : null}
          <p className="text-sm leading-relaxed text-muted-foreground">
            Thiết lập cách hệ thống gợi ý lịch chính thức cho tuần tới: xét giới hạn ca của nhân
            viên và bảng đăng ký ca họ đã gửi. Năm luật hệ thống bên dưới được thuật toán xếp ca
            áp dụng trực tiếp; bạn có thể thêm luật riêng của chi nhánh ở cuối.
          </p>
        </DialogHeader>

        {isLoading ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">Đang tải…</p>
        ) : (
          <div className="space-y-8 px-6 py-6">
            {BRANCH_RULE_SECTIONS.map((section) => (
              <section key={section.id} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-medium">{section.label}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <div className="space-y-3">
                  {section.keys.map((key) => {
                    const rule = rulesMap.get(key);
                    if (!rule) return null;
                    return (
                      <SystemRuleField
                        key={key}
                        rule={rule}
                        canWrite={canWrite}
                        onChange={(value) =>
                          mutateRules((current) => patchRuleValue(current, key, value))
                        }
                      />
                    );
                  })}
                </div>
              </section>
            ))}

            <section className="space-y-4 border-t pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <h2 className="text-sm font-medium">{CUSTOM_RULES_SECTION.label}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {CUSTOM_RULES_SECTION.description}
                  </p>
                </div>
                {canWrite ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      mutateRules((current) => [...current, createCustomRule(customRules.length)])
                    }
                  >
                    <PlusIcon className="size-4" />
                    Thêm luật riêng
                  </Button>
                ) : null}
              </div>

              {customRules.length === 0 ? (
                <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                  Chưa có luật riêng. Thêm quy định nội bộ nếu chi nhánh cần ghi nhận thêm ngoài
                  bộ luật hệ thống.
                </p>
              ) : (
                <div className="space-y-4">
                  {customRules.map((rule) => (
                    <CustomRuleField
                      key={rule.key}
                      rule={rule}
                      canWrite={canWrite}
                      onUpdate={(patch) =>
                        mutateRules((current) => patchRule(current, rule.key, patch))
                      }
                      onRemove={() => mutateRules((current) => removeRule(current, rule.key))}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Đóng
          </Button>
          {canWrite ? (
            <Button
              type="button"
              disabled={updatePolicy.isPending || isLoading}
              onClick={() => void saveRules()}
            >
              {updatePolicy.isPending ? "Đang lưu…" : "Lưu luật"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SystemRuleField({
  rule,
  canWrite,
  onChange,
}: {
  rule: LocationSchedulingRule;
  canWrite: boolean;
  onChange: (value: LocationSchedulingRule["value"]) => void;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-medium">{rule.inputLabel}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{rule.content}</p>
        </div>
        <div className="shrink-0 pt-0.5">
          {rule.valueType === "boolean" ? (
            <Switch
              checked={Boolean(rule.value)}
              disabled={!canWrite}
              onCheckedChange={onChange}
              aria-label={rule.inputLabel}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                className="w-16 text-center"
                value={rule.value === null ? "" : String(rule.value)}
                disabled={!canWrite}
                onChange={(event) => onChange(Number(event.target.value))}
                aria-label={rule.inputLabel}
              />
              <span className="text-xs text-muted-foreground">ca</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomRuleField({
  rule,
  canWrite,
  onUpdate,
  onRemove,
}: {
  rule: LocationSchedulingRule;
  canWrite: boolean;
  onUpdate: (patch: Partial<LocationSchedulingRule>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Luật riêng
        </p>
        {canWrite ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label="Xóa luật riêng"
          >
            <Trash2Icon className="size-4" />
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor={`${rule.key}-title`}>
            Tên luật
          </label>
          <Input
            id={`${rule.key}-title`}
            value={rule.inputLabel}
            disabled={!canWrite}
            placeholder="Ví dụ: Tối đa 2 ca cuối tuần cho part-time"
            onChange={(event) => onUpdate({ inputLabel: event.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor={`${rule.key}-content`}>
            Giải thích cho manager
          </label>
          <Textarea
            id={`${rule.key}-content`}
            value={rule.content}
            disabled={!canWrite}
            placeholder="Mô tả ngắn khi nào áp dụng, ai cần tuân thủ…"
            rows={2}
            onChange={(event) => onUpdate({ content: event.target.value })}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor={`${rule.key}-type`}>
              Kiểu giá trị
            </label>
            <Select
              value={rule.valueType}
              disabled={!canWrite}
              onValueChange={(valueType) =>
                onUpdate({
                  valueType: valueType as LocationSchedulingRule["valueType"],
                  value: valueType === "boolean" ? false : valueType === "number" ? 0 : "",
                })
              }
            >
              <SelectTrigger id={`${rule.key}-type`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(VALUE_TYPE_LABELS) as LocationSchedulingRule["valueType"][]).map(
                  (type) => (
                    <SelectItem key={type} value={type}>
                      {VALUE_TYPE_LABELS[type]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor={`${rule.key}-value`}>
              Giá trị / ghi chú
            </label>
            {rule.valueType === "boolean" ? (
              <div className="flex h-10 items-center justify-between rounded-md border bg-background px-3">
                <span className="text-sm text-muted-foreground">Áp dụng</span>
                <Switch
                  checked={Boolean(rule.value)}
                  disabled={!canWrite}
                  onCheckedChange={(value) => onUpdate({ value })}
                />
              </div>
            ) : (
              <Input
                id={`${rule.key}-value`}
                type={rule.valueType === "number" ? "number" : "text"}
                value={rule.value === null ? "" : String(rule.value)}
                disabled={!canWrite}
                placeholder={rule.valueType === "number" ? "0" : "Nội dung ghi chú"}
                onChange={(event) =>
                  onUpdate({
                    value:
                      rule.valueType === "number"
                        ? Number(event.target.value)
                        : event.target.value,
                  })
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
