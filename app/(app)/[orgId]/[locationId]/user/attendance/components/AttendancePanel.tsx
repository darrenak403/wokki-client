"use client";

import { useEffect, useMemo, useState } from "react";
import { differenceInMinutes, format, isToday, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { OTClockOutButton } from "@/app/(app)/[orgId]/[locationId]/user/attendance/components/OTClockOutButton";
import { NoEmployeeLinked } from "@/app/(app)/[orgId]/[locationId]/user/components/NoEmployeeLinked";
import {
  useAttendanceHistoryQuery,
  useClockInMutation,
  useClockOutMutation,
  useOpenAttendanceRecord,
} from "@/hooks/useAttendance";
import { blobToBase64, useCheckInVerification } from "@/hooks/useCheckInVerification";
import { useMyOTRequestsQuery } from "@/hooks/useOvertimeRequests";
import { useMyProfileQuery } from "@/hooks/useMyProfile";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { fetchSelf } from "@/lib/api/services/fetchSelf";
import type { ApiError } from "@/types/api";
import { OVERTIME_STATUS } from "@/types/overtime";
import { formatDurationShort, isShiftAttendanceClosed, isShiftEnded } from "./attendance-utils";
import { AttendanceHistoryTable } from "./AttendanceHistoryTable";
import { AttendanceStats } from "./AttendanceStats";
import { ShiftClockCard } from "./ShiftClockCard";
import { TodayShiftSidebar } from "./TodayShiftSidebar";

const VERIFICATION_STAGE_LABEL: Record<string, string> = {
  "requesting-permission": "Đang xin quyền vị trí/camera…",
  "model-loading": "Đang tải mô hình nhận diện…",
  capturing: "Đang ghi nhận khuôn mặt…",
  comparing: "Đang so khớp khuôn mặt…",
};

export function AttendancePanel() {
  const {
    data: assignments = [],
    isError: scheduleError,
    error: scheduleErr,
  } = useMyScheduleQuery();
  const { data: history = [], isLoading: historyLoading } = useAttendanceHistoryQuery();
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();
  const openRecord = useOpenAttendanceRecord();
  const { data: myProfile } = useMyProfileQuery();
  const verification = useCheckInVerification();
  const { data: myOTPage } = useMyOTRequestsQuery();
  const myOTRequests = myOTPage?.items ?? [];
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const scheduleErrorCode =
    scheduleError && scheduleErr && typeof scheduleErr === "object" && "messageCode" in scheduleErr
      ? (scheduleErr as unknown as ApiError).messageCode
      : undefined;

  const todayShifts = useMemo(
    () => assignments.filter((a) => isToday(parseISO(a.date))),
    [assignments]
  );
  const selectedShift =
    todayShifts.find((shift) => shift.id === selectedAssignmentId) ?? todayShifts[0];
  const currentShift =
    todayShifts.find((shift) => shift.id === openRecord?.assignmentId) ?? selectedShift;
  const monthLabel = format(now, "MMMM", { locale: vi });
  const closedHistory = history.filter((row) => row.clockOut !== null);
  const totalWorkedMinutes = closedHistory.reduce((total, row) => total + row.workedMinutes, 0);

  if (scheduleErrorCode === "ME_NO_EMPLOYEE") {
    return <NoEmployeeLinked />;
  }

  const shiftRecord = currentShift ? history.find((r) => r.assignmentId === currentShift.id) : null;
  const shiftCompleted = isShiftAttendanceClosed(shiftRecord);

  const canClockIn = !openRecord && todayShifts.length > 0 && !shiftCompleted;
  const canClockOut = Boolean(openRecord);
  const verificationPending = !["idle", "done", "skipped"].includes(verification.stage);
  const actionPending = clockInMutation.isPending || clockOutMutation.isPending || verificationPending;
  const selectedShiftEnded = !openRecord && isShiftEnded(currentShift, now);
  const selectable = !openRecord && todayShifts.length > 1;

  const activeOTRequest = myOTRequests.find(
    (r) =>
      r.shiftAssignmentId === currentShift?.id &&
      (r.status === OVERTIME_STATUS.Pending || r.status === OVERTIME_STATUS.PendingApproval)
  );
  const anyOpenOTRequest = myOTRequests.find((r) => r.status === OVERTIME_STATUS.Pending);
  const hasAttendanceForShift =
    !!openRecord || history.some((r) => r.assignmentId === currentShift?.id);
  const canRequestOT =
    isShiftEnded(currentShift, now) && hasAttendanceForShift && !activeOTRequest && !!currentShift;

  const workedMinutes = openRecord
    ? differenceInMinutes(now, parseISO(openRecord.clockIn))
    : shiftRecord?.clockOut
      ? shiftRecord.workedMinutes
      : null;
  const workedDisplay = workedMinutes !== null ? formatDurationShort(workedMinutes) : null;

  async function handleClockIn() {
    let storedFaceEmbeddingJson: string | null = null;
    if (myProfile?.hasFaceEnrollment) {
      try {
        storedFaceEmbeddingJson = (await fetchSelf.getFaceDescriptor()).faceEmbeddingJson;
      } catch {
        storedFaceEmbeddingJson = null;
      }
    }
    const result = await verification.capture(storedFaceEmbeddingJson);
    let photoBase64: string | undefined;
    if (result.photo) {
      try {
        photoBase64 = await blobToBase64(result.photo);
      } catch {
        photoBase64 = undefined;
      }
    }
    void clockInMutation.mutateAsync({
      assignmentId: selectedShift?.id,
      latitude: result.latitude ?? undefined,
      longitude: result.longitude ?? undefined,
      photoBase64,
      photoContentType: photoBase64 ? "image/jpeg" : undefined,
      faceEmbeddingJson: result.faceEmbeddingJson ?? undefined,
      faceMatch: result.faceMatch ?? undefined,
    });
  }

  const verificationStageLabel = VERIFICATION_STAGE_LABEL[verification.stage];

  return (
    <div className="space-y-8">
      {anyOpenOTRequest ? (
        <OTClockOutButton
          overtimeRequestId={anyOpenOTRequest.id}
          startedAt={anyOpenOTRequest.startedAt}
        />
      ) : null}

      <AttendanceStats
        historyCount={history.length}
        totalWorkedMinutes={totalWorkedMinutes}
        openRecordCount={openRecord ? 1 : 0}
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ShiftClockCard
          currentShift={currentShift}
          openRecord={openRecord ?? undefined}
          closedRecord={shiftCompleted ? (shiftRecord ?? undefined) : undefined}
          workedDisplay={workedDisplay}
          canClockIn={canClockIn}
          canClockOut={canClockOut}
          selectedShiftEnded={selectedShiftEnded}
          actionPending={actionPending}
          clockInPending={clockInMutation.isPending || verificationPending}
          clockOutPending={clockOutMutation.isPending}
          canRequestOT={canRequestOT}
          onClockIn={() => void handleClockIn()}
          onClockOut={() => void clockOutMutation.mutateAsync()}
        />
        {verificationStageLabel ? (
          <p className="text-sm text-muted-foreground xl:col-span-2">{verificationStageLabel}</p>
        ) : null}
        <TodayShiftSidebar
          todayShifts={todayShifts}
          activeShiftId={currentShift?.id}
          selectable={selectable}
          onSelect={setSelectedAssignmentId}
        />
      </section>

      <AttendanceHistoryTable
        monthLabel={monthLabel}
        history={history}
        myOTRequests={myOTRequests}
        isLoading={historyLoading}
      />
    </div>
  );
}
