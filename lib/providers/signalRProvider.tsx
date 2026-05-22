"use client";

import { ReactNode } from "react";
import { useChatHub } from "@/hooks/useChatHub";
import { useSignalR } from "@/hooks/useSignalR";
import { useSignalRNotifications } from "@/hooks/useSignalRNotifications";

/**
 * Auto-connect SignalR khi app load (sau auth).
 * - `/hubs/app` — thông báo (useSignalR + useSignalRNotifications)
 * - `/ws/chat` — chat Wave 6 (useChatHub)
 */
export function SignalRProvider({ children }: { children: ReactNode }) {
  useSignalR();
  useSignalRNotifications();
  useChatHub();
  return <>{children}</>;
}
