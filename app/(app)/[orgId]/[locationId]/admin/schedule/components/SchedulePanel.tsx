"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CopyWeekDialog } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/CopyWeekDialog";
import { LeaveRequestsDialog } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/LeaveRequestsDialog";
import { PreferenceBoardDialog } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/PreferenceBoardDialog";
import { ScheduleGrid } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/ScheduleGrid";
import { ScheduleWorkspaceBar } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/ScheduleWorkspaceBar";
import { isScheduleBoardVisible } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/ScheduleWorkflowStepper";
import { SuggestionsSheet } from "@/app/(app)/[orgId]/[locationId]/admin/schedule/components/SuggestionsSheet";
import { DepartmentScopeChips } from "@/components/shared/department-scope-chips";
import { Label } from "@/components/ui/label";
import { scheduleKeys } from "@/lib/api/query-keys";
import { useDepartmentsQuery } from "@/hooks/useDepartments";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import {
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
  usePublishScheduleMutation,
  useScheduleDetailQuery,
  useScheduleListQuery,
  useUnpublishScheduleMutation,
} from "@/hooks/useSchedule";
import { usePreferenceBoardQuery } from "@/hooks/usePreferenceBoard";
import {
  isScheduleDraft,
  isScheduleEditable,
  scheduleStatusLabel,
} from "@/lib/support/schedule/status";
import { addWeeksISO, toMondayISO } from "@/lib/support/schedule/week";
import { EMPTY_REBALANCE_HINTS, SCHEDULE_STATUS } from "@/types/schedule";
import { cn } from "@/lib/utils";
import { addDays, format, parseISO } from "date-fns";
import type { ApiError } from "@/types/api";

const primaryActionClass =
  "bg-brand-blue text-white hover:bg-brand-navy dark:bg-brand-blue dark:hover:bg-brand-navy";

export function SchedulePanel() {
  const queryClient = useQueryClient();
  const { session, setDepartmentId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;
  const { data: departments = [] } = useDepartmentsQuery(locationId);
  const [weekStartDate, setWeekStartDate] = useState(() => toMondayISO(new Date()));
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [boardScheduleIdHint, setBoardScheduleIdHint] = useState<string | null>(null);

  useEffect(() => {
    if (!locationId || departmentId || departments.length === 0) return;
    const firstActive = departments.find((dept) => dept.isActive) ?? departments[0];
    if (firstActive) setDepartmentId(firstActive.id);
  }, [departmentId, departments, locationId, setDepartmentId]);

  const listParams = departmentId && weekStartDate ? { departmentId, weekStartDate } : null;

  const {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
  } = useScheduleListQuery(listParams);
  const scheduleId = listData?.items[0]?.id ?? null;
  const { data: detail, isLoading: detailLoading } = useScheduleDetailQuery(scheduleId);

  const createMutation = useCreateScheduleMutation(listParams);
  const deleteMutation = useDeleteScheduleMutation(scheduleId ?? "", listParams);
  const publishMutation = usePublishScheduleMutation(scheduleId ?? "", listParams);
  const unpublishMutation = useUnpublishScheduleMutation(scheduleId ?? "", listParams);

  const schedule = detail?.schedule ?? listData?.items[0];
  const draftSchedule = listData?.items.find((item) => isScheduleDraft(item.status)) ?? null;
  const preferenceBoardSchedule = schedule ?? draftSchedule;
  const showPreferenceBoard = isScheduleBoardVisible(schedule?.status);
  const assignments = detail?.assignments ?? [];
  const rebalanceHints = detail?.rebalanceHints ?? EMPTY_REBALANCE_HINTS;
  const status = schedule?.status ?? SCHEDULE_STATUS.Draft;
  const editable = isScheduleEditable(status);
  const isDraft = isScheduleDraft(status);
  const isPublished = status === SCHEDULE_STATUS.Published;
  const showRebalanceBanner =
    isDraft &&
    (rebalanceHints.hasRecentPreferenceChanges ||
      rebalanceHints.conflictCount > 0 ||
      rebalanceHints.pendingLeaveCount > 0);
  const currentWeekStartDate = useMemo(() => toMondayISO(new Date()), []);
  const canDeleteDraftSchedule =
    Boolean(scheduleId && schedule) && isDraft && schedule!.weekStartDate > currentWeekStartDate;

  const { data: preferenceBoard } = usePreferenceBoardQuery(
    showPreferenceBoard ? scheduleId : null,
    Boolean(showPreferenceBoard && scheduleId),
  );

  const weekRangeLabel = useMemo(() => {
    const start = parseISO(weekStartDate);
    const startLabel = format(start, "dd/MM");
    const endLabel = format(addDays(start, 6), "dd/MM/yyyy");
    return `${startLabel} – ${endLabel}`;
  }, [weekStartDate]);

  const handleCreateSchedule = async () => {
    if (!listParams) return;
    try {
      await createMutation.mutateAsync({
        departmentId: listParams.departmentId,
        weekStartDate: listParams.weekStartDate,
      });
      await refetchList();
    } catch (error) {
      const code = (error as ApiError).messageCode;
      if (code === "SCHEDULE_ALREADY_EXISTS") {
        await refetchList();
        void queryClient.invalidateQueries({ queryKey: scheduleKeys.list(listParams) });
      }
    }
  };

  const handlePublish = async () => {
    if (!scheduleId) return;
    await publishMutation.mutateAsync();
    setPublishOpen(false);
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleId) return;
    await deleteMutation.mutateAsync();
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 border-b pb-4">
        <DepartmentScopeChips
          locationId={locationId}
          value={departmentId}
          onChange={setDepartmentId}
          allowAll={false}
          maxVisible={5}
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tuần</Label>
            <div className="flex h-9 items-center rounded-lg border border-input bg-background shadow-xs">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-none rounded-l-lg"
                aria-label="Tuần trước"
                onClick={() => setWeekStartDate((w) => addWeeksISO(w, -1))}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <span className="min-w-[148px] border-x border-input px-3 text-center text-sm font-semibold">
                {weekRangeLabel}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-none rounded-r-lg"
                aria-label="Tuần sau"
                onClick={() => setWeekStartDate((w) => addWeeksISO(w, 1))}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
          {schedule ? (
            <div className="flex items-center gap-1.5 pt-5 text-sm text-muted-foreground">
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  isPublished ? "bg-emerald-500" : isDraft ? "bg-amber-500" : "bg-neutral-400",
                )}
                aria-hidden
              />
              {scheduleStatusLabel(schedule.status)}
            </div>
          ) : null}
        </div>
      </div>

      {!locationId ? (
        <p className="text-sm text-muted-foreground">Chọn chi nhánh trước.</p>
      ) : departments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có phòng ban trong chi nhánh này.</p>
      ) : !departmentId ? (
        <p className="text-sm text-muted-foreground">Chọn phòng ban để xem lịch.</p>
      ) : listLoading || (scheduleId && detailLoading) ? (
        <p className="text-sm text-muted-foreground">Đang tải lịch…</p>
      ) : !scheduleId ? (
        <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Chưa có lịch cho phòng ban và tuần này.
          </p>
          <Button
            className={primaryActionClass}
            disabled={createMutation.isPending}
            onClick={() => void handleCreateSchedule()}
          >
            {createMutation.isPending ? "Đang tạo…" : "Tạo lịch tuần"}
          </Button>
        </div>
      ) : schedule && locationId ? (
        <div className="space-y-4">
          <ScheduleWorkspaceBar
            hasSchedule={Boolean(scheduleId)}
            status={status}
            submittedCount={preferenceBoard?.submittedCount ?? 0}
            employeeCount={preferenceBoard?.employeeCount ?? 0}
            assignmentCount={assignments.length}
            showPreferenceBoard={showPreferenceBoard}
            editable={editable}
            isDraft={isDraft}
            isPublished={isPublished}
            canDeleteDraftSchedule={canDeleteDraftSchedule}
            unpublishPending={unpublishMutation.isPending}
            onOpenBoard={() => setBoardOpen(true)}
            onOpenSuggest={() => setSuggestOpen(true)}
            onOpenPublish={() => setPublishOpen(true)}
            onOpenCopy={() => setCopyOpen(true)}
            onOpenDelete={() => setDeleteOpen(true)}
            onUnpublish={() => void unpublishMutation.mutateAsync()}
          />

          {showRebalanceBanner ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-300/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
              <p className="min-w-0 flex-1">
                Có thay đổi đăng ký / xin nghỉ — kiểm tra bảng đăng ký trước khi gợi ý lại.
                {rebalanceHints.conflictCount > 0
                  ? ` (${rebalanceHints.conflictCount} ca không khớp)`
                  : null}
                {rebalanceHints.pendingLeaveCount > 0
                  ? ` · ${rebalanceHints.pendingLeaveCount} đơn chờ duyệt`
                  : null}
              </p>
              <div className="flex flex-wrap gap-2">
                {rebalanceHints.pendingLeaveCount > 0 ? (
                  <Button size="sm" variant="outline" onClick={() => setLeaveOpen(true)}>
                    Duyệt xin nghỉ
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => setBoardOpen(true)}>
                  Bảng đăng ký
                </Button>
                <Button size="sm" onClick={() => setSuggestOpen(true)}>
                  Gợi ý AI
                </Button>
              </div>
            </div>
          ) : null}

          <ScheduleGrid
            scheduleId={schedule.id}
            departmentId={schedule.departmentId}
            locationId={locationId}
            weekStartDate={schedule.weekStartDate}
            status={schedule.status}
            assignments={assignments}
          />

          {boardOpen ? (
            <PreferenceBoardDialog
              key={`${weekStartDate}-${boardScheduleIdHint ?? preferenceBoardSchedule?.id ?? "board"}`}
              open={boardOpen}
              onOpenChange={setBoardOpen}
              departmentId={schedule.departmentId}
              weekStartDate={weekStartDate}
              scheduleIdHint={boardScheduleIdHint ?? preferenceBoardSchedule?.id ?? null}
              onWeekChange={(nextWeek) => {
                setWeekStartDate(nextWeek);
                setBoardScheduleIdHint(null);
              }}
            />
          ) : null}

          <SuggestionsSheet
            open={suggestOpen}
            onOpenChange={setSuggestOpen}
            scheduleId={schedule.id}
            locationId={locationId}
            listParams={listParams!}
            status={schedule.status}
            conflictCount={rebalanceHints.conflictCount}
            currentAssignments={assignments}
          />

          <LeaveRequestsDialog
            open={leaveOpen}
            onOpenChange={setLeaveOpen}
            scheduleId={schedule.id}
            weekStartDate={schedule.weekStartDate}
          />

          <CopyWeekDialog
            open={copyOpen}
            onOpenChange={setCopyOpen}
            scheduleId={schedule.id}
            sourceWeekStartDate={schedule.weekStartDate}
            listParams={listParams!}
            onCopied={(target, copiedScheduleId) => {
              setWeekStartDate(target);
              setBoardScheduleIdHint(copiedScheduleId);
            }}
          />

          <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Công bố lịch tuần?</AlertDialogTitle>
                <AlertDialogDescription>
                  Nhân viên sẽ thấy lịch sau khi công bố. Bạn vẫn có thể huỷ công bố để chỉnh sửa
                  lại.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handlePublish()}>Công bố</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xoá lịch nháp?</AlertDialogTitle>
                <AlertDialogDescription>
                  Lịch nháp của tuần {weekRangeLabel} và các phân ca trong lịch này sẽ bị xoá.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteMutation.isPending}
                  onClick={() => void handleDeleteSchedule()}
                >
                  {deleteMutation.isPending ? "Đang xoá…" : "Xoá lịch"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}
    </div>
  );
}
