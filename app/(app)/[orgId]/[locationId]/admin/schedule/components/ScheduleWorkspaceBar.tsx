"use client";

import {
  CopyIcon,
  MoreHorizontalIcon,
  SparklesIcon,
  Trash2Icon,
  Undo2Icon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ScheduleWorkflowHeader,
  type ScheduleWorkflowProps,
} from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/ScheduleWorkflowStepper";
import { cn } from "@/lib/utils";

type ScheduleWorkspaceBarProps = ScheduleWorkflowProps & {
  showPreferenceBoard: boolean;
  editable: boolean;
  isDraft: boolean;
  isPublished: boolean;
  canDeleteDraftSchedule: boolean;
  unpublishPending: boolean;
  onOpenBoard: () => void;
  onOpenSuggest: () => void;
  onOpenPublish: () => void;
  onOpenCopy: () => void;
  onOpenDelete: () => void;
  onUnpublish: () => void;
};

export function ScheduleWorkspaceBar({
  showPreferenceBoard,
  editable,
  isDraft,
  isPublished,
  canDeleteDraftSchedule,
  unpublishPending,
  onOpenBoard,
  onOpenSuggest,
  onOpenPublish,
  onOpenCopy,
  onOpenDelete,
  onUnpublish,
  ...workflowProps
}: ScheduleWorkspaceBarProps) {
  const { submittedCount, employeeCount } = workflowProps;
  const hasPreferenceHint =
    showPreferenceBoard && employeeCount > 0 && submittedCount === 0;

  return (
    <section className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <ScheduleWorkflowHeader {...workflowProps} />
        {hasPreferenceHint ? (
          <p className="text-xs text-muted-foreground">
            Chưa có đăng ký — nhắc nhân viên tab{" "}
            <span className="text-foreground/80">Lịch của tôi → Đăng ký ca</span>
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {showPreferenceBoard ? (
          <Button type="button" variant="ghost" size="sm" onClick={onOpenBoard}>
            <UsersIcon className="size-4" />
            <span className="hidden sm:inline">Bảng đăng ký</span>
          </Button>
        ) : null}
        {editable ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onOpenSuggest}
            className={cn(
              "group relative overflow-hidden border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-indigo-50",
              "shadow-[0_0_14px_-6px] shadow-violet-400/50",
              "hover:border-violet-300 hover:from-violet-100/80 hover:to-indigo-100/80 hover:shadow-violet-400/60",
              "dark:border-violet-800/50 dark:from-violet-950/35 dark:via-background dark:to-indigo-950/35",
              "dark:hover:border-violet-700 dark:hover:from-violet-950/50 dark:hover:to-indigo-950/50",
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(167, 139, 250, 0.15) 50%, transparent 60%)",
              }}
            />
            <SparklesIcon className="size-4 text-violet-600 transition-transform group-hover:scale-110 dark:text-violet-400" />
            <span className="hidden bg-gradient-to-r from-violet-700 via-indigo-600 to-violet-600 bg-clip-text font-medium text-transparent sm:inline dark:from-violet-300 dark:via-indigo-300 dark:to-violet-300">
              Gợi ý AI
            </span>
          </Button>
        ) : null}
        {isDraft ? (
          <Button
            type="button"
            size="sm"
            className="bg-brand-blue text-white hover:bg-brand-navy"
            onClick={onOpenPublish}
          >
            Công bố
          </Button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8"
                aria-label="Thêm thao tác"
              />
            }
          >
            <MoreHorizontalIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onOpenCopy}>
              <CopyIcon />
              Sao chép tuần
            </DropdownMenuItem>
            {isPublished ? (
              <DropdownMenuItem disabled={unpublishPending} onClick={onUnpublish}>
                <Undo2Icon />
                Huỷ công bố
              </DropdownMenuItem>
            ) : null}
            {canDeleteDraftSchedule ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onOpenDelete}>
                  <Trash2Icon />
                  Xoá lịch nháp
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
