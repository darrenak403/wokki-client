"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  Trash2Icon,
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
import { CopyWeekDialog } from "@/app/(app)/admin/schedule/components/CopyWeekDialog";
import { PreferenceBoardDialog } from "@/app/(app)/admin/schedule/components/PreferenceBoardDialog";
import { ScheduleGrid } from "@/app/(app)/admin/schedule/components/ScheduleGrid";
import { SuggestionsSheet } from "@/app/(app)/admin/schedule/components/SuggestionsSheet";
import { DepartmentSelect } from "@/components/shared/department-select";
import { LocationSelect } from "@/components/shared/location-select";
import { scheduleKeys } from "@/lib/api/query-keys";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import {
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
  usePublishScheduleMutation,
  useScheduleDetailQuery,
  useScheduleListQuery,
  useUnpublishScheduleMutation,
} from "@/hooks/useSchedule";
import {
  isScheduleDraft,
  isScheduleEditable,
  scheduleStatusLabel,
} from "@/lib/support/schedule/status";
import { addWeeksISO, toMondayISO } from "@/lib/support/schedule/week";
import { SCHEDULE_STATUS } from "@/types/schedule";
import { cn } from "@/lib/utils";
import { addDays, format, parseISO } from "date-fns";
import type { ApiError } from "@/types/api";

const primaryActionClass =
  "bg-brand-blue text-white hover:bg-brand-navy dark:bg-brand-blue dark:hover:bg-brand-navy";

export function SchedulePanel() {
  const queryClient = useQueryClient();
  const { session, setLocationId, setDepartmentId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;
  const [weekStartDate, setWeekStartDate] = useState(() => toMondayISO(new Date()));
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [boardScheduleIdHint, setBoardScheduleIdHint] = useState<string | null>(null);

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
  const currentWeekStartDate = useMemo(() => toMondayISO(new Date()), []);
  const canViewAnySchedulePreferenceBoard = weekStartDate <= currentWeekStartDate;
  const preferenceBoardSchedule = canViewAnySchedulePreferenceBoard ? schedule : draftSchedule;
  const assignments = detail?.assignments ?? [];
  const status = schedule?.status ?? SCHEDULE_STATUS.Draft;
  const editable = isScheduleEditable(status);
  const isDraft = isScheduleDraft(status);
  const isPublished = status === SCHEDULE_STATUS.Published;
  const canDeleteDraftSchedule =
    Boolean(scheduleId && schedule) && isDraft && schedule!.weekStartDate > currentWeekStartDate;

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
    <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm md:p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-4 border-b border-neutral-100 pb-5 dark:border-neutral-800 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 min-w-[160px]">
            <span className="text-xs font-medium text-muted-foreground">Chi nhánh</span>
            <LocationSelect value={locationId} onChange={setLocationId} />
          </div>
          <div className="space-y-1.5 min-w-[160px]">
            <span className="text-xs font-medium text-muted-foreground">Phòng ban</span>
            <DepartmentSelect
              locationId={locationId}
              value={departmentId}
              onChange={setDepartmentId}
              allowEmpty={false}
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Tuần</span>
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
        </div>
        {schedule ? (
          <div
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold",
              isPublished
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                : isDraft
                  ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                  : "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            )}
          >
            {isPublished ? <CheckCircle2Icon className="size-4 shrink-0" /> : null}
            {scheduleStatusLabel(schedule.status)}
          </div>
        ) : null}
      </div>

      {!locationId || !departmentId ? (
        <p className="pt-5 text-sm text-muted-foreground">Chọn chi nhánh và phòng ban để xem lịch.</p>
      ) : listLoading || (scheduleId && detailLoading) ? (
        <p className="pt-5 text-sm text-muted-foreground">Đang tải lịch…</p>
      ) : !scheduleId ? (
        <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center pt-5 mt-5">
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
        <>
          <div className="flex flex-wrap gap-2 pt-5 pb-4">
            {preferenceBoardSchedule ? (
              <Button className={primaryActionClass} onClick={() => setBoardOpen(true)}>
                Bảng đăng ký ca
              </Button>
            ) : null}
            {editable ? (
              <Button variant="outline" onClick={() => setSuggestOpen(true)}>
                <SparklesIcon />
                Gợi ý phân ca
              </Button>
            ) : null}
            {isDraft ? (
              <Button className={primaryActionClass} onClick={() => setPublishOpen(true)}>
                Công bố lịch
              </Button>
            ) : null}
            {isPublished ? (
              <Button
                variant="outline"
                className="border-brand-blue text-brand-blue hover:bg-brand-mist/60 dark:border-brand-medium dark:text-brand-light"
                disabled={unpublishMutation.isPending}
                onClick={() => void unpublishMutation.mutateAsync()}
              >
                Huỷ công bố
              </Button>
            ) : null}
            <Button className={primaryActionClass} onClick={() => setCopyOpen(true)}>
              Sao chép tuần
            </Button>
            {canDeleteDraftSchedule ? (
              <Button
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
                disabled={deleteMutation.isPending}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon />
                Xoá lịch nháp
              </Button>
            ) : null}
          </div>

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
            listParams={listParams!}
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
        </>
      ) : null}
    </div>
  );
}
