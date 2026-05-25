"use client";

import { useEffect, useState } from "react";
import { differenceInMinutes, parseISO } from "date-fns";
import { TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClockOutOTMutation } from "@/hooks/useOvertimeRequests";

interface OTClockOutButtonProps {
  overtimeRequestId: string;
  startedAt: string;
}

function formatElapsed(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
}

export function OTClockOutButton({ overtimeRequestId, startedAt }: OTClockOutButtonProps) {
  const [elapsed, setElapsed] = useState(() =>
    differenceInMinutes(new Date(), parseISO(startedAt)),
  );
  const mutation = useClockOutOTMutation();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed(differenceInMinutes(new Date(), parseISO(startedAt)));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
        <TimerIcon className="size-4 shrink-0 animate-pulse" />
        <span>Đang tăng ca · {formatElapsed(elapsed)}</span>
      </div>
      <Button
        size="lg"
        variant="outline"
        className="h-12 flex-1 text-base border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/40"
        disabled={mutation.isPending}
        onClick={() => void mutation.mutateAsync(overtimeRequestId)}
      >
        {mutation.isPending ? "Đang kết thúc…" : "Kết thúc tăng ca"}
      </Button>
    </div>
  );
}
