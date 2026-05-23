"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { addDays, format, parseISO } from "date-fns";
import type { ApiError } from "@/types/api";

export function SchedulePanel() {
  const queryClient = useQueryClient();
  const { session, setLocationId, setDepartmentId } = useFoundationSession();
  const locationId = session.selectedLocationId;
  const departmentId = session.selectedDepartmentId;
  const [weekStartDate, setWeekStartDate] = useState(() => toMondayISO(new Date()));
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const listParams = departmentId && weekStartDate ? { departmentId, weekStartDate } : null;

  const {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
  } = useScheduleListQuery(listParams);
  const scheduleId = listData?.items[0]?.id ?? null;
  const { data: detail, isLoading: detailLoading } = useScheduleDetailQuery(scheduleId);

  const createMutation = useCreateScheduleMutation(listParams);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Chi nhánh</span>
          <LocationSelect value={locationId} onChange={setLocationId} />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Phòng ban</span>
          <DepartmentSelect
            locationId={locationId}
            value={departmentId}
            onChange={setDepartmentId}
            allowEmpty={false}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tuần</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tuần trước"
              onClick={() => setWeekStartDate((w) => addWeeksISO(w, -1))}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="min-w-[130px] text-center text-sm font-medium">{weekRangeLabel}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tuần sau"
              onClick={() => setWeekStartDate((w) => addWeeksISO(w, 1))}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
        {schedule ? (
          <Badge variant={isDraft ? "secondary" : "default"}>
            {scheduleStatusLabel(schedule.status)}
          </Badge>
        ) : null}
      </div>

      {!locationId || !departmentId ? (
        <p className="text-sm text-muted-foreground">Chọn chi nhánh và phòng ban để xem lịch.</p>
      ) : listLoading || (scheduleId && detailLoading) ? (
        <p className="text-sm text-muted-foreground">Đang tải lịch…</p>
      ) : !scheduleId ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Chưa có lịch cho phòng ban và tuần này.
          </p>
          <Button disabled={createMutation.isPending} onClick={() => void handleCreateSchedule()}>
            {createMutation.isPending ? "Đang tạo…" : "Tạo lịch tuần"}
          </Button>
        </div>
      ) : schedule && locationId ? (
        <>
          <div className="flex flex-wrap gap-2">
            {preferenceBoardSchedule ? (
              <Button variant="outline" size="sm" onClick={() => setBoardOpen(true)}>
                Bảng đăng ký ca
              </Button>
            ) : null}
            {editable ? (
              <Button variant="outline" size="sm" onClick={() => setSuggestOpen(true)}>
                <SparklesIcon className="size-4 mr-1" />
                Gợi ý phân ca
              </Button>
            ) : null}
            {isDraft ? (
              <Button size="sm" onClick={() => setPublishOpen(true)}>
                Công bố lịch
              </Button>
            ) : null}
            {isPublished ? (
              <Button
                variant="outline"
                size="sm"
                disabled={unpublishMutation.isPending}
                onClick={() => void unpublishMutation.mutateAsync()}
              >
                Huỷ công bố
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => setCopyOpen(true)}>
              Sao chép tuần
            </Button>
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
              open={boardOpen}
              onOpenChange={setBoardOpen}
              departmentId={schedule.departmentId}
              weekStartDate={weekStartDate}
              initialScheduleId={preferenceBoardSchedule?.id ?? null}
              onWeekChange={setWeekStartDate}
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
            onCopied={(target) => setWeekStartDate(target)}
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
        </>
      ) : null}
    </div>
  );
}
