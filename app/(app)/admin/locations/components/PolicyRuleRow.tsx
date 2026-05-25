"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getValueUnit } from "@/lib/support/schedule/location-scheduling-rules";
import type { LocationSchedulingRule } from "@/types/foundation";

export function PolicyRuleRow({
  rule,
  canWrite,
  showCategoryTag,
  onUpdate,
  onValueChange,
}: {
  rule: LocationSchedulingRule;
  canWrite: boolean;
  showCategoryTag: boolean;
  onUpdate: (patch: Partial<LocationSchedulingRule>) => void;
  onValueChange: (value: LocationSchedulingRule["value"]) => void;
}) {
  const unit = getValueUnit(rule);

  return (
    <li className="flex flex-wrap items-center gap-4 py-4 sm:flex-nowrap">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{rule.inputLabel}</p>
          {(showCategoryTag || rule.category !== "customRules") && (
            <Badge variant="outline" className="font-mono text-[10px] font-normal">
              {rule.category}
            </Badge>
          )}
          {rule.isRequired ? (
            <Badge variant="destructive" className="text-[10px]">
              Bắt buộc
            </Badge>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{rule.content}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:ml-auto">
        {rule.valueType === "boolean" ? (
          <Switch
            checked={Boolean(rule.value)}
            disabled={!canWrite}
            onCheckedChange={(checked) => onUpdate({ value: checked, enabled: checked })}
            aria-label={rule.inputLabel}
          />
        ) : (
          <>
            <Switch
              checked={rule.enabled}
              disabled={!canWrite}
              onCheckedChange={(enabled) => onUpdate({ enabled })}
              aria-label={`Bật ${rule.inputLabel}`}
            />
            {rule.valueType === "number" ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  className="h-9 w-16 text-center"
                  value={rule.value === null ? "" : String(rule.value)}
                  disabled={!canWrite || !rule.enabled}
                  onChange={(event) => onValueChange(Number(event.target.value))}
                  aria-label={rule.inputLabel}
                />
                {unit ? (
                  <span className="max-w-32 text-xs text-muted-foreground">{unit}</span>
                ) : null}
              </div>
            ) : (
              <Input
                className="h-9 w-40"
                value={rule.value === null ? "" : String(rule.value)}
                disabled={!canWrite || !rule.enabled}
                onChange={(event) => onValueChange(event.target.value)}
                aria-label={rule.inputLabel}
              />
            )}
          </>
        )}
      </div>
    </li>
  );
}
