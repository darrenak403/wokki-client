"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { useCreateSwapMutation, useSwapTargetsQuery } from "@/hooks/useSwapRequests";

type SwapCreateFormProps = {
  myEmployeeId: string | null;
};

function formatAssignment(shiftName: string, startTime: string, endTime: string, date: string) {
  return `${shiftName} (${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}) · ${format(
    parseISO(date),
    "dd/MM",
  )}`;
}

export function SwapCreateForm({ myEmployeeId }: SwapCreateFormProps) {
  const { data: myAssignments = [] } = useMyScheduleQuery();
  const {
    data: targets = [],
    isLoading: targetsLoading,
    isError: targetsError,
  } = useSwapTargetsQuery({}, Boolean(myEmployeeId));

  const createMutation = useCreateSwapMutation();
  const [requesterId, setRequesterId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [note, setNote] = useState("");

  const peerTargets = targets.filter((target) => target.employeeId !== myEmployeeId);

  const handleSubmit = async () => {
    if (!requesterId || !targetId) return;
    await createMutation.mutateAsync({
      requesterAssignmentId: requesterId,
      targetAssignmentId: targetId,
      requesterNote: note.trim() || null,
    });
    setRequesterId("");
    setTargetId("");
    setNote("");
  };

  return (
    <div className="space-y-5 rounded-lg border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Gửi yêu cầu mới</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chọn ca của bạn và ca đối tác để gửi yêu cầu đổi ca.
        </p>
      </div>

      {targetsError ? (
        <p className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          Chưa tải được danh sách ca đối tác. Vui lòng thử lại sau.
        </p>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel>Ca của bạn</FieldLabel>
          <select
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={requesterId}
            onChange={(event) => setRequesterId(event.target.value)}
            aria-label="Chọn ca của bạn"
          >
            <option value="">Chọn ca của bạn</option>
            {myAssignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {formatAssignment(
                  assignment.shiftName,
                  assignment.startTime,
                  assignment.endTime,
                  assignment.date,
                )}
              </option>
            ))}
          </select>
        </Field>

        {!targetsError && !targetsLoading && peerTargets.length === 0 ? (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            Không có ca đối tác khả dụng trong khoảng thời gian này.
          </p>
        ) : null}

        <Field>
          <FieldLabel>Ca đối tác</FieldLabel>
          <select
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            value={targetId}
            disabled={targetsLoading || targetsError}
            onChange={(event) => setTargetId(event.target.value)}
            aria-label="Chọn ca đối tác"
          >
            <option value="">{targetsLoading ? "Đang tải…" : "Chọn ca đối tác"}</option>
            {peerTargets.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {formatAssignment(
                  assignment.shiftName,
                  assignment.startTime,
                  assignment.endTime,
                  assignment.date,
                )}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Lý do</FieldLabel>
          <textarea
            className="min-h-28 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Nhập lý do đổi ca của bạn..."
          />
        </Field>
      </FieldGroup>

      <Button
        className="h-11 w-full"
        disabled={!requesterId || !targetId || createMutation.isPending}
        onClick={() => void handleSubmit()}
      >
        <SendIcon className="size-4" />
        {createMutation.isPending ? "Đang gửi…" : "Gửi yêu cầu"}
      </Button>
    </div>
  );
}
