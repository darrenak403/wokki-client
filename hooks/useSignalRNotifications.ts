"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { startHubConnection } from "@/lib/realtime/signalr";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice";

export function useSignalRNotifications() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    let connection: Awaited<ReturnType<typeof startHubConnection>> = null;

    const handleNotification = (message: string, title?: string) => {
      toast(title || "Thông báo", { description: message });
    };

    void (async () => {
      connection = await startHubConnection();
      if (!connection || cancelled) return;
      connection.on("ReceiveNotification", handleNotification);
    })();

    return () => {
      cancelled = true;
      connection?.off("ReceiveNotification", handleNotification);
    };
  }, [isAuthenticated]);
}
