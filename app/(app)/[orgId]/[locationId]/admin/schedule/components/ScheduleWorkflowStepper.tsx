"use client";

import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isScheduleDraft, isSchedulePublished } from "@/lib/support/schedule/status";
import type { ScheduleStatus } from "@/types/schedule";

export type ScheduleWorkflowProps = {
  status: ScheduleStatus;
  hasSchedule: boolean;
  submittedCount: number;
  employeeCount: number;
  assignmentCount: number;
};

const STEPS = [
  { id: 1, label: "Tạo lịch" },
  { id: 2, label: "Đăng ký ca" },
  { id: 3, label: "Phân ca" },
  { id: 4, label: "Công bố" },
] as const;

function stepDone(stepId: number, props: ScheduleWorkflowProps): boolean {
  const { hasSchedule, submittedCount, assignmentCount, status } = props;
  switch (stepId) {
    case 1:
      return hasSchedule;
    case 2:
      return submittedCount > 0;
    case 3:
      return assignmentCount > 0;
    case 4:
      return isSchedulePublished(status);
    default:
      return false;
  }
}

function activeStep(props: ScheduleWorkflowProps): number {
  if (!props.hasSchedule) return 1;
  if (isSchedulePublished(props.status)) return 4;
  if (props.assignmentCount > 0) return 4;
  if (props.submittedCount > 0) return 3;
  return 2;
}

function stepLabel(stepId: number, base: string, props: ScheduleWorkflowProps): string {
  if (stepId === 2 && props.employeeCount > 0) {
    return `${base} ${props.submittedCount}/${props.employeeCount}`;
  }
  if (stepId === 3 && props.assignmentCount > 0) {
    return `${base} ${props.assignmentCount}`;
  }
  return base;
}

export function ScheduleWorkflowHeader(props: ScheduleWorkflowProps) {
  const current = activeStep(props);

  return (
    <ol className="flex flex-wrap items-center gap-0.5">
      {STEPS.map((step, index) => {
        const done = stepDone(step.id, props);
        const isCurrent = step.id === current && !done;

        return (
          <li key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-1 rounded-md px-1 py-0.5 text-sm",
                isCurrent && "font-medium text-foreground",
                !isCurrent && !done && "text-muted-foreground/70",
                done && !isCurrent && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
                  done && "bg-emerald-600 text-white",
                  isCurrent && "bg-brand-blue text-white",
                  !done && !isCurrent && "border border-border text-muted-foreground",
                )}
                aria-hidden
              >
                {done ? <CheckIcon className="size-2.5" strokeWidth={3} /> : step.id}
              </span>
              <span>{stepLabel(step.id, step.label, props)}</span>
            </div>
            {index < STEPS.length - 1 ? (
              <ChevronRightIcon className="mx-0.5 size-3 text-muted-foreground/30" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function isScheduleBoardVisible(status: ScheduleStatus | undefined): boolean {
  if (status === undefined) return false;
  return isScheduleDraft(status) || isSchedulePublished(status);
}
