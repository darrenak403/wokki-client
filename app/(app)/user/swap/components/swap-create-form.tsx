"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useMyScheduleQuery } from "@/hooks/useMySchedule";
import { useCreateSwapMutation, useSwapTargetsQuery } from "@/hooks/useSwapRequests";
import { format, parseISO } from "date-fns";

type SwapCreateFormProps = {
  myEmployeeId: string | null;
};

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
  const [manualTargetId, setManualTargetId] = useState("");

  const peerTargets = targets.filter((t) => t.employeeId !== myEmployeeId);
  const useManualTarget = targetsError;

  const handleSubmit = async () => {
    const finalTarget = useManualTarget ? manualTargetId.trim() : targetId;
    if (!requesterId || !finalTarget) return;
    await createMutation.mutateAsync({
      requesterAssignmentId: requesterId,
      targetAssignmentId: finalTarget,
      requesterNote: note.trim() || null,
    });
    setRequesterId("");
    setTargetId("");
    setManualTargetId("");
    setNote("");
  };

  const formatAssignment = (id: string, shiftName: string, date: string) =>
    `${shiftName} · ${format(parseISO(date), "dd/MM")} · ${id.slice(0, 8)}…`;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h2 className="text-sm font-medium">Gửi yêu cầu mới</h2>

      {targetsError ? (
        <p className="text-sm text-amber-700 dark:text-amber-400 rounded-md bg-amber-500/10 p-3">
          API <code className="text-xs">GET /self/swap-targets</code> chưa sẵn sàng — nhập
          GUID phân ca đối tác (tạm thời cho QA) hoặc chờ BE bổ sung endpoint.
        </p>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel>Ca của bạn</FieldLabel>
          <select
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={requesterId}
            onChange={(e) => setRequesterId(e.target.value)}
            aria-label="Chọn ca của bạn"
          >
            <option value="">Chọn ca</option>
            {myAssignments.map((a) => (
              <option key={a.id} value={a.id}>
                {formatAssignment(a.id, a.shiftName, a.date)}
              </option>
            ))}
          </select>
        </Field>

        {!useManualTarget && !targetsLoading && peerTargets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Không có ca đối tác khả dụng trong khoảng thời gian này.
          </p>
        ) : null}

        {useManualTarget ? (
          <Field>
            <FieldLabel>ID phân ca đối tác (GUID)</FieldLabel>
            <Input
              value={manualTargetId}
              onChange={(e) => setManualTargetId(e.target.value)}
              placeholder="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
            />
          </Field>
        ) : (
          <Field>
            <FieldLabel>Ca đối tác</FieldLabel>
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={targetId}
              disabled={targetsLoading}
              onChange={(e) => setTargetId(e.target.value)}
              aria-label="Chọn ca đối tác"
            >
              <option value="">
                {targetsLoading ? "Đang tải…" : "Chọn ca đối tác"}
              </option>
              {peerTargets.map((a) => (
                <option key={a.id} value={a.id}>
                  {formatAssignment(a.id, a.shiftName, a.date)}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field>
          <FieldLabel>Ghi chú</FieldLabel>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Lý do đổi ca…" />
        </Field>
      </FieldGroup>

      <Button
        disabled={
          !requesterId ||
          (!useManualTarget ? !targetId : !manualTargetId.trim()) ||
          createMutation.isPending
        }
        onClick={() => void handleSubmit()}
      >
        {createMutation.isPending ? "Đang gửi…" : "Gửi yêu cầu"}
      </Button>
    </div>
  );
}
