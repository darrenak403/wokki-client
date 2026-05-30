"use client";

import { Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  getValueUnit,
  VALUE_TYPE_LABELS,
} from "@/lib/support/schedule/org-scheduling-rules";
import type { SchedulingRule } from "@/types/foundation";

export function CustomRuleRow({
  rule,
  canWrite,
  showCategoryTag,
  onUpdate,
  onRemove,
}: {
  rule: SchedulingRule;
  canWrite: boolean;
  showCategoryTag: boolean;
  onUpdate: (patch: Partial<SchedulingRule>) => void;
  onRemove: () => void;
}) {
  const unit = getValueUnit(rule);
  const title = rule.inputLabel.trim() || "Luật riêng chưa đặt tên";

  return (
    <li className="space-y-3 py-4">
      <div className="flex flex-wrap items-start gap-4 sm:flex-nowrap">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {showCategoryTag ? (
              <Badge variant="outline" className="font-mono text-[10px] font-normal">
                {rule.category}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                Ghi chú — solver không áp dụng
              </Badge>
            )}
          </div>
          {rule.content ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{rule.content}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:ml-auto">
          {rule.valueType === "boolean" ? (
            <Switch
              checked={Boolean(rule.value)}
              disabled={!canWrite}
              onCheckedChange={(value) => onUpdate({ value, enabled: true })}
              aria-label={title}
            />
          ) : (
            <>
              <Switch
                checked={rule.enabled}
                disabled={!canWrite}
                onCheckedChange={(enabled) => onUpdate({ enabled })}
                aria-label={`Bật ${title}`}
              />
              {rule.valueType === "number" ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="h-9 w-16 text-center"
                    value={rule.value === null ? "" : String(rule.value)}
                    disabled={!canWrite || !rule.enabled}
                    onChange={(event) => onUpdate({ value: Number(event.target.value), enabled: true })}
                  />
                  {unit ? <span className="text-xs text-muted-foreground">{unit}</span> : null}
                </div>
              ) : (
                <Input
                  className="h-9 w-40"
                  value={rule.value === null ? "" : String(rule.value)}
                  disabled={!canWrite || !rule.enabled}
                  onChange={(event) => onUpdate({ value: event.target.value, enabled: true })}
                />
              )}
            </>
          )}
          {canWrite ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              aria-label="Xóa luật riêng"
            >
              <Trash2Icon className="size-4 text-muted-foreground" />
            </Button>
          ) : null}
        </div>
      </div>

      {canWrite ? (
        <div className="grid gap-3 rounded-lg border border-dashed bg-muted/20 p-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs text-muted-foreground" htmlFor={`${rule.key}-title`}>
              Tên luật
            </Label>
            <Input
              id={`${rule.key}-title`}
              value={rule.inputLabel}
              placeholder="Ví dụ: Tối đa 2 ca cuối tuần cho part-time"
              onChange={(event) => onUpdate({ inputLabel: event.target.value })}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs text-muted-foreground" htmlFor={`${rule.key}-content`}>
              Giải thích
            </Label>
            <Textarea
              id={`${rule.key}-content`}
              value={rule.content}
              rows={2}
              placeholder="Mô tả ngắn khi nào áp dụng…"
              onChange={(event) => onUpdate({ content: event.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground" htmlFor={`${rule.key}-type`}>
              Kiểu giá trị
            </Label>
            <Select
              value={rule.valueType}
              onValueChange={(valueType) =>
                onUpdate({
                  valueType: valueType as SchedulingRule["valueType"],
                  value: valueType === "boolean" ? false : valueType === "number" ? 0 : "",
                })
              }
            >
              <SelectTrigger id={`${rule.key}-type`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(VALUE_TYPE_LABELS) as SchedulingRule["valueType"][]).map(
                  (type) => (
                    <SelectItem key={type} value={type}>
                      {VALUE_TYPE_LABELS[type]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}
    </li>
  );
}
